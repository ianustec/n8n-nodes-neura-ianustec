import { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NeuraIanustecCredentials, OpenAIError } from '../nodes/NeuraIanustec/types';

export class NeuraIanustecClient {
	private executeFunctions: IExecuteFunctions;
	private credentials: NeuraIanustecCredentials;

	constructor(executeFunctions: IExecuteFunctions, credentials: NeuraIanustecCredentials) {
		this.executeFunctions = executeFunctions;
		this.credentials = credentials;
	}

	private async sleep(ms: number): Promise<void> {
		return new Promise((resolve) => {
			const timer = global.setTimeout(resolve, ms);
			return timer;
		});
	}

	private isRetryableError(error: any): boolean {
		if (!error.response) return false;
		
		const status = error.response.status;
		// Retry on rate limits, timeouts, server errors, and specific client errors
		return [408, 409, 423, 425, 429, 500, 502, 503, 504].includes(status);
	}

	private calculateBackoffDelay(attempt: number): number {
		// Simple exponential backoff: 2s, 4s, 6s
		return Math.min(2000 * (attempt + 1), 6000);
	}

	async makeRequest<T>(
		endpoint: string,
		method: 'GET' | 'POST' = 'POST',
		body?: any,
		maxRetries: number = 2,
	): Promise<T> {
		const baseUrl = this.credentials.baseUrl.replace(/\/$/, '');
		const url = `${baseUrl}${endpoint}`;

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.credentials.apiKey}`,
		};

		if (this.credentials.organization) {
			headers['OpenAI-Organization'] = this.credentials.organization;
		}

		const requestOptions: IHttpRequestOptions = {
			method,
			url,
			headers,
			timeout: this.credentials.timeout || 60000,
		};

		if (body && method === 'POST') {
			requestOptions.body = body;
		}

		let lastError: any;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				const response = await this.executeFunctions.helpers.httpRequest(requestOptions);
				return response as T;
			} catch (error: any) {
				lastError = error;

				// Don't retry on the last attempt
				if (attempt === maxRetries) {
					break;
				}

				// Check if error is retryable
				if (!this.isRetryableError(error)) {
					break;
				}

				// Calculate backoff delay
				const delay = this.calculateBackoffDelay(attempt);
				
				// Log retry attempt (using global console if available)
				if (typeof global !== 'undefined' && global.console) {
					global.console.log(
						`NEURA | IANUSTEC AI: Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms. Error: ${error.message}`,
					);
				}

				await this.sleep(delay);
			}
		}

		// Format and throw the final error
		throw this.formatError(lastError);
	}

	private formatError(error: any): Error {
		if (error.response?.data) {
			const errorData = error.response.data as OpenAIError;
			if (errorData.error) {
				const message = `${errorData.error.type || 'API Error'}: ${errorData.error.message}`;
				const formattedError = new Error(message);
				(formattedError as any).httpCode = error.response.status;
				(formattedError as any).errorType = errorData.error.type;
				(formattedError as any).param = errorData.error.param;
				(formattedError as any).code = errorData.error.code;
				return formattedError;
			}
		}

		if (error.response) {
			const message = `HTTP ${error.response.status}: ${error.response.statusText || 'Unknown error'}`;
			const formattedError = new Error(message);
			(formattedError as any).httpCode = error.response.status;
			return formattedError;
		}

		if (error.code === 'ECONNREFUSED') {
			return new Error('Connection refused - check if the API endpoint is accessible');
		}

		if (error.code === 'ENOTFOUND') {
			return new Error('DNS resolution failed - check the base URL');
		}

		if (error.code === 'ETIMEDOUT') {
			return new Error('Request timeout - try increasing the timeout value');
		}

		return error instanceof Error ? error : new Error(String(error));
	}

	async chatCompletions(payload: any): Promise<any> {
		return this.makeRequest('/chat/completions', 'POST', payload);
	}

	async embeddings(payload: any): Promise<any> {
		return this.makeRequest('/embeddings', 'POST', payload);
	}

	async listModels(): Promise<any> {
		return this.makeRequest('/models', 'GET');
	}
}
