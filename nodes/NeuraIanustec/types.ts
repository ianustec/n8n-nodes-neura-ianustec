export interface ChatMessage {
	role: 'system' | 'user' | 'assistant' | 'tool' | 'function';
	content?: string;
	name?: string;
	tool_calls?: ToolCall[];
	tool_call_id?: string;
	function_call?: FunctionCall;
}

export interface ToolCall {
	id: string;
	type: 'function';
	function: {
		name: string;
		arguments: string;
	};
}

export interface FunctionCall {
	name: string;
	arguments: string;
}

export interface Tool {
	type: 'function';
	function: {
		name: string;
		description?: string;
		parameters?: Record<string, any>;
	};
}

export interface ChatCompletionRequest {
	model: string;
	messages: ChatMessage[];
	temperature?: number;
	top_p?: number;
	max_tokens?: number;
	stream?: boolean;
	tools?: Tool[];
	tool_choice?: 'none' | 'auto' | { type: 'function'; function: { name: string } };
	functions?: any[]; // Legacy support
	function_call?: any; // Legacy support
}

export interface ChatCompletionResponse {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: ChatChoice[];
	usage: Usage;
}

export interface ChatChoice {
	index: number;
	message: ChatMessage;
	finish_reason: string;
}

export interface Usage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
}

export interface EmbeddingsRequest {
	model: string;
	input: string | string[];
	encoding_format?: 'float' | 'base64';
	dimensions?: number;
	user?: string;
}

export interface EmbeddingsResponse {
	object: string;
	data: EmbeddingData[];
	model: string;
	usage: Usage;
}

export interface EmbeddingData {
	object: string;
	embedding: number[];
	index: number;
}

export interface OpenAIError {
	error: {
		message: string;
		type: string;
		param?: string;
		code?: string;
	};
}

export interface NeuraIanustecCredentials {
	baseUrl: string;
	apiKey: string;
	organization?: string;
	timeout: number;
	rejectUnauthorized: boolean;
}
