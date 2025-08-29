import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

import { nodeProperties } from './descriptions';
import { NeuraIanustecClient } from '../../utils/client';
import { buildChatCompletionRequest, buildEmbeddingsRequest, parseToolsJson, parseToolChoice } from '../../utils/schema';
import {
	NeuraIanustecCredentials,
	ChatMessage,
	ChatCompletionResponse,
	EmbeddingsResponse,
} from './types';

export class NeuraIanustec implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NEURA | IANUSTEC AI',
		name: 'neuraIanustec',
		icon: 'file:neura-ianustec.svg',
		group: ['ai'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with NEURA | IANUSTEC AI services using OpenAI-compatible API',
		defaults: {
			name: 'NEURA | IANUSTEC AI',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'neuraIanustecApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			},
		},
		properties: nodeProperties,
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('neuraIanustecApi') as NeuraIanustecCredentials;

		const client = new NeuraIanustecClient(this, credentials);

		// Process each item in the batch
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				let responseData: any;

				if (resource === 'chat' && operation === 'create') {
					responseData = await executeChatCompletion.call(this, client, itemIndex);
				} else if (resource === 'embeddings' && operation === 'create') {
					responseData = await executeEmbeddings.call(this, client, itemIndex);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown resource "${resource}" or operation "${operation}"`,
						{ itemIndex },
					);
				}

				// Handle advanced options
				const advancedOptions = this.getNodeParameter('advancedOptions', itemIndex, {}) as any;
				const storeRaw = advancedOptions.storeRaw || false;
				const binaryFile = advancedOptions.binaryFile || '';

				let outputData: INodeExecutionData = {
					json: responseData,
				};

				// Add raw response if requested
				if (storeRaw) {
					outputData.json.raw = responseData;
				}

				// Add binary output if requested
				if (binaryFile) {
					const binaryData = Buffer.from(JSON.stringify(responseData, null, 2));
					outputData.binary = {
						[binaryFile]: {
							data: binaryData.toString('base64'),
							mimeType: 'application/json',
							fileName: binaryFile,
						},
					};
				}

				returnData.push(outputData);

			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					returnData.push({
						json: {
							error: errorMessage,
							itemIndex,
						},
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}

}

async function executeChatCompletion(
	this: IExecuteFunctions,
	client: NeuraIanustecClient,
	itemIndex: number,
): Promise<any> {
	const model = this.getNodeParameter('model', itemIndex) as string;
	const systemMessage = this.getNodeParameter('systemMessage', itemIndex, '') as string;
	const userMessage = this.getNodeParameter('userMessage', itemIndex) as string;
	const temperature = this.getNodeParameter('temperature', itemIndex, 0.7) as number;
	const topP = this.getNodeParameter('topP', itemIndex, 1) as number;
	const maxTokens = this.getNodeParameter('maxTokens', itemIndex, '') as number;
	const toolsJson = this.getNodeParameter('toolsJson', itemIndex, '') as string;

	// Build messages array
	const messages: ChatMessage[] = [];
	
	if (systemMessage.trim()) {
		messages.push({
			role: 'system',
			content: systemMessage.trim(),
		});
	}

	messages.push({
		role: 'user',
		content: userMessage,
	});

	// Parse tools if provided
	let tools;
	let toolChoice;
	if (toolsJson.trim()) {
		try {
			tools = parseToolsJson(toolsJson);
			toolChoice = parseToolChoice(toolsJson);
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				`Invalid tools JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
				{ itemIndex },
			);
		}
	}

	// Build request
	const requestPayload = buildChatCompletionRequest(model, messages, {
		temperature,
		top_p: topP,
		max_tokens: maxTokens > 0 ? maxTokens : undefined,
		tools,
		tool_choice: toolChoice,
	});

	// Make API call
	const response = await client.chatCompletions(requestPayload) as ChatCompletionResponse;

	// Extract and format response
	const choice = response.choices?.[0];
	if (!choice) {
		throw new NodeOperationError(
			this.getNode(),
			'No choices returned from API',
			{ itemIndex },
		);
	}

	return {
		content: choice.message?.content || '',
		finish_reason: choice.finish_reason,
		model: response.model,
		created: response.created,
		usage: response.usage,
		message: choice.message, // Include full message for tool calls
	};
}

async function executeEmbeddings(
	this: IExecuteFunctions,
	client: NeuraIanustecClient,
	itemIndex: number,
): Promise<any> {
	const model = this.getNodeParameter('embModel', itemIndex) as string;
	const input = this.getNodeParameter('embInput', itemIndex) as string;

	// Try to parse input as JSON array, fallback to string
	let parsedInput: string | string[];
	try {
		const parsed = JSON.parse(input);
		if (Array.isArray(parsed)) {
			parsedInput = parsed;
		} else {
			parsedInput = input;
		}
	} catch {
		parsedInput = input;
	}

	// Build request
	const requestPayload = buildEmbeddingsRequest(model, parsedInput);

	// Make API call
	const response = await client.embeddings(requestPayload) as EmbeddingsResponse;

	// Format response
	return {
		model: response.model,
		embeddings: response.data,
		usage: response.usage,
	};
}
