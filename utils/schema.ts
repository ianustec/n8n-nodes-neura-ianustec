import {
	ChatCompletionRequest,
	EmbeddingsRequest,
	ChatMessage,
	Tool,
} from '../nodes/NeuraIanustec/types';

export function validateChatMessage(message: any): ChatMessage {
	if (!message || typeof message !== 'object') {
		throw new Error('Invalid message format');
	}

	const validRoles = ['system', 'user', 'assistant', 'tool', 'function'];
	if (!validRoles.includes(message.role)) {
		throw new Error(`Invalid message role: ${message.role}`);
	}

	return {
		role: message.role,
		content: message.content || undefined,
		name: message.name || undefined,
		tool_calls: message.tool_calls || undefined,
		tool_call_id: message.tool_call_id || undefined,
		function_call: message.function_call || undefined,
	};
}

export function buildChatCompletionRequest(
	model: string,
	messages: ChatMessage[],
	options: {
		temperature?: number;
		top_p?: number;
		max_tokens?: number;
		tools?: Tool[];
		tool_choice?: any;
		functions?: any[];
		function_call?: any;
	} = {},
): ChatCompletionRequest {
	const request: ChatCompletionRequest = {
		model,
		messages: messages.map(validateChatMessage),
		stream: false, // Always false for n8n
	};

	// Add optional parameters
	if (options.temperature !== undefined) {
		request.temperature = Math.max(0, Math.min(2, options.temperature));
	}

	if (options.top_p !== undefined) {
		request.top_p = Math.max(0, Math.min(1, options.top_p));
	}

	if (options.max_tokens !== undefined && options.max_tokens > 0) {
		request.max_tokens = options.max_tokens;
	}

	// Tools and function calling pass-through
	if (options.tools && options.tools.length > 0) {
		request.tools = options.tools;
		if (options.tool_choice) {
			request.tool_choice = options.tool_choice;
		}
	}

	// Legacy function calling support
	if (options.functions && options.functions.length > 0) {
		request.functions = options.functions;
		if (options.function_call) {
			request.function_call = options.function_call;
		}
	}

	return request;
}

export function buildEmbeddingsRequest(
	model: string,
	input: string | string[],
	options: {
		encoding_format?: 'float' | 'base64';
		dimensions?: number;
		user?: string;
	} = {},
): EmbeddingsRequest {
	const request: EmbeddingsRequest = {
		model,
		input,
	};

	if (options.encoding_format) {
		request.encoding_format = options.encoding_format;
	}

	if (options.dimensions && options.dimensions > 0) {
		request.dimensions = options.dimensions;
	}

	if (options.user) {
		request.user = options.user;
	}

	return request;
}

export function parseToolsJson(toolsJson: string): Tool[] | undefined {
	if (!toolsJson || toolsJson.trim() === '') {
		return undefined;
	}

	try {
		const parsed = JSON.parse(toolsJson);
		
		// Handle both direct tools array and object with tools property
		if (Array.isArray(parsed)) {
			return parsed;
		}
		
		if (parsed.tools && Array.isArray(parsed.tools)) {
			return parsed.tools;
		}

		// Single tool object
		if (parsed.type === 'function') {
			return [parsed];
		}

		throw new Error('Invalid tools format');
	} catch (error) {
		throw new Error(`Invalid tools JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

export function parseToolChoice(toolsJson: string): any {
	if (!toolsJson || toolsJson.trim() === '') {
		return undefined;
	}

	try {
		const parsed = JSON.parse(toolsJson);
		return parsed.tool_choice || undefined;
	} catch {
		return undefined;
	}
}
