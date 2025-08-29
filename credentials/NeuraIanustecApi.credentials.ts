import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NeuraIanustecApi implements ICredentialType {
	name = 'neuraIanustecApi';
	displayName = 'NEURA | IANUSTEC AI API';
	documentationUrl = 'httpsGithubComIanustecN8nNodesNeuraIanustec';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://llm-neura-service.llm-neura.svc.cluster.local/v1',
			description: 'The base URL for the NEURA API endpoint (pre-configured for internal NEURA services)',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: 'aa3cd3ec5a34b5d180a83927dd1f604c0164e28685b3e5cf93ecf04f0c2667ee',
			description: 'Your NEURA API key for authentication (pre-configured for internal services)',
			required: true,
		},
		{
			displayName: 'Organization ID',
			name: 'organization',
			type: 'string',
			default: '',
			description: 'Optional organization ID (leave empty for NEURA internal services)',
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
			default: false,
			description: 'Whether to reject requests with invalid SSL certificates (disabled for internal NEURA services)',
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
