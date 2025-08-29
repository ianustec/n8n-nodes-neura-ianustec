import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NeuraIanustecApi implements ICredentialType {
	name = 'neuraIanustecApi';
	displayName = 'NEURA | IANUSTEC AI API';
	documentationUrl = 'neuraIanustec';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.openai.com/v1',
			description: 'The base URL for the API endpoint (e.g., https://api.openai.com/v1 or your custom endpoint)',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your API key for authentication',
			required: true,
		},
		{
			displayName: 'Organization ID',
			name: 'organization',
			type: 'string',
			default: '',
			description: 'Optional organization ID for OpenAI API requests',
			required: false,
		},
		{
			displayName: 'Request Timeout (ms)',
			name: 'timeout',
			type: 'number',
			default: 60000,
			description: 'Request timeout in milliseconds',
			required: false,
		},
		{
			displayName: 'Reject Unauthorized',
			name: 'rejectUnauthorized',
			type: 'boolean',
			default: true,
			description: 'Whether to reject requests with invalid SSL certificates',
			required: false,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/models',
			method: 'GET',
			headers: {
				'OpenAI-Organization': '={{$credentials.organization}}',
			},
		},
	};
}
