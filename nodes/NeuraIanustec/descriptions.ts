import { INodeProperties } from 'n8n-workflow';

export const neuraIanustecOperations: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Chat',
				value: 'chat',
				description: 'Generate chat completions using AI models',
			},
			{
				name: 'Embedding',
				value: 'embeddings',
				description: 'Generate embeddings for text inputs',
			},
		],
		default: 'chat',
		required: true,
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['chat'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a chat completion',
				action: 'Create a chat completion',
			},
		],
		default: 'create',
		required: true,
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['embeddings'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create embeddings',
				action: 'Create embeddings',
			},
		],
		default: 'create',
		required: true,
	},
];

export const chatFields: INodeProperties[] = [
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['create'],
			},
		},
		default: 'gpt-4o-mini',
		description: 'The model to use for chat completion',
		required: true,
	},
	{
		displayName: 'System Message',
		name: 'systemMessage',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'System message to set the behavior of the assistant',
		placeholder: 'You are a helpful assistant...',
	},
	{
		displayName: 'User Message',
		name: 'userMessage',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The user message to send to the model',
		required: true,
		placeholder: 'Hello, how can you help me?',
	},
	{
		displayName: 'Temperature',
		name: 'temperature',
		type: 'number',
		typeOptions: {
			minValue: 0,
			maxValue: 2,
			numberStepSize: 0.1,
		},
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['create'],
			},
		},
		default: 0.7,
		description: 'Controls randomness in the output. Higher values make output more random.',
	},
	{
		displayName: 'Top P',
		name: 'topP',
		type: 'number',
		typeOptions: {
			minValue: 0,
			maxValue: 1,
			numberStepSize: 0.05,
		},
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['create'],
			},
		},
		default: 1,
		description: 'Controls diversity via nucleus sampling. Lower values make output more focused.',
	},
	{
		displayName: 'Max Tokens',
		name: 'maxTokens',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Maximum number of tokens to generate (leave empty for model default)',
	},
	{
		displayName: 'Tools JSON',
		name: 'toolsJson',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'JSON object containing tools/functions definition and tool_choice (pass-through to API)',
		placeholder: '{"tools": [{"type": "function", "function": {"name": "get_weather", "description": "Get weather info"}}], "tool_choice": "auto"}',
	},
];

export const embeddingsFields: INodeProperties[] = [
	{
		displayName: 'Model',
		name: 'embModel',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['embeddings'],
				operation: ['create'],
			},
		},
		default: 'text-embedding-ada-002',
		description: 'The model to use for embeddings',
		required: true,
	},
	{
		displayName: 'Input',
		name: 'embInput',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['embeddings'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Text input to generate embeddings for. Can be a string or JSON array of strings.',
		required: true,
		placeholder: 'The quick brown fox jumps over the lazy dog',
	},
];

export const advancedFields: INodeProperties[] = [
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Store Raw Response',
				name: 'storeRaw',
				type: 'boolean',
				default: false,
				description: 'Whether to include the raw API response in the output JSON',
			},
			{
				displayName: 'Binary File Name',
				name: 'binaryFile',
				type: 'string',
				default: '',
				description: 'If specified, saves the raw response as a binary file with this name (e.g., "response.JSON")',
				placeholder: 'response.json',
			},
		],
	},
];

export const nodeProperties: INodeProperties[] = [
	...neuraIanustecOperations,
	...chatFields,
	...embeddingsFields,
	...advancedFields,
];
