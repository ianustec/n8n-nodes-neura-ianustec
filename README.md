# n8n-nodes-neura-ianustec

![NEURA | IANUSTEC AI](https://img.shields.io/badge/NEURA-IANUSTEC%20AI-blue)
![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-orange)
![Version](https://img.shields.io/badge/version-0.1.0-green)

A powerful n8n Community Node for integrating with **NEURA | IANUSTEC AI** services using OpenAI-compatible APIs. This node supports Chat Completions and Embeddings with advanced features like tool/function calling, retry logic, and binary output.

## 🚀 Features

- **OpenAI-Compatible API**: Works with OpenAI API, LiteLLM, vLLM, and other compatible endpoints
- **Chat Completions**: Generate AI responses with system/user messages, temperature control, and tool calling
- **Embeddings**: Create vector embeddings for text inputs (strings or arrays)
- **Tool Integration**: Usable as a Tool in n8n AI Agents with `usableAsTool: true`
- **Advanced Error Handling**: Retry logic with exponential backoff for rate limits and timeouts
- **Binary Output**: Save raw API responses as JSON files
- **Batch Processing**: Process multiple items efficiently with proper error isolation
- **Configurable Endpoints**: Support for custom base URLs and authentication

## 📦 Installation

### Option 1: Via n8n Community Nodes UI

1. Go to **Settings** → **Community Nodes** in your n8n instance
2. Click **Install a community node**
3. Enter: `n8n-nodes-neura-ianustec`
4. Click **Install**

### Option 2: Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n/nodes

# Install the package
npm install n8n-nodes-neura-ianustec

# Restart n8n
```

### Option 3: Development Installation

```bash
# Clone the repository
git clone https://github.com/ianustec/n8n-nodes-neura-ianustec.git
cd n8n-nodes-neura-ianustec

# Install dependencies
pnpm install

# Build the project
pnpm build

# Link for development
npm link
```

## 🔧 Configuration

### 1. Create Credentials

Before using the node, create **NEURA | IANUSTEC AI API** credentials:

1. Go to **Credentials** in n8n
2. Click **Create New**
3. Search for "NEURA | IANUSTEC AI API"
4. Fill in the required fields:

| Field | Description | Default | Required |
|-------|-------------|---------|----------|
| **Base URL** | API endpoint URL | `https://api.openai.com/v1` | ✅ |
| **API Key** | Your authentication key | - | ✅ |
| **Organization ID** | OpenAI organization (optional) | - | ❌ |
| **Request Timeout** | Timeout in milliseconds | `60000` | ❌ |
| **Reject Unauthorized** | Verify SSL certificates | `true` | ❌ |

### 2. Supported Endpoints

The node works with any OpenAI-compatible API:

- **OpenAI**: `https://api.openai.com/v1`
- **LiteLLM**: `http://your-litellm-server:4000`
- **vLLM**: `http://your-vllm-server:8000/v1`
- **Custom Endpoints**: Any API following OpenAI schema

## 📚 Usage Examples

### Chat Completions

#### Basic Chat
```json
{
  "resource": "chat",
  "operation": "create",
  "model": "gpt-4o-mini",
  "systemMessage": "You are a helpful assistant specialized in data analysis.",
  "userMessage": "Explain the benefits of using n8n for automation.",
  "temperature": 0.7
}
```

#### With Tool Calling
```json
{
  "resource": "chat",
  "operation": "create",
  "model": "gpt-4o-mini",
  "userMessage": "What's the weather like in Paris?",
  "toolsJson": {
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get current weather for a city",
          "parameters": {
            "type": "object",
            "properties": {
              "city": {"type": "string", "description": "City name"}
            },
            "required": ["city"]
          }
        }
      }
    ],
    "tool_choice": "auto"
  }
}
```

### Embeddings

#### Single Text
```json
{
  "resource": "embeddings",
  "operation": "create",
  "embModel": "text-embedding-ada-002",
  "embInput": "This is a sample text for embedding generation."
}
```

#### Multiple Texts
```json
{
  "resource": "embeddings",
  "operation": "create",
  "embModel": "text-embedding-ada-002",
  "embInput": "[\"First text\", \"Second text\", \"Third text\"]"
}
```

### Advanced Options

#### Store Raw Response + Binary Output
```json
{
  "advancedOptions": {
    "storeRaw": true,
    "binaryFile": "api_response.json"
  }
}
```

## 🔄 Response Format

### Chat Completions Response
```json
{
  "content": "Generated response text",
  "finish_reason": "stop",
  "model": "gpt-4o-mini",
  "created": 1699123456,
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 50,
    "total_tokens": 75
  },
  "message": {
    "role": "assistant",
    "content": "Generated response text"
  }
}
```

### Embeddings Response
```json
{
  "model": "text-embedding-ada-002",
  "embeddings": [
    {
      "object": "embedding",
      "embedding": [0.1, 0.2, -0.3, ...],
      "index": 0
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "total_tokens": 10
  }
}
```

## 🛠️ Error Handling

The node includes comprehensive error handling:

### Automatic Retry
- **Rate Limits (429)**: Exponential backoff (2s → 4s → 6s)
- **Timeouts (408)**: Automatic retry with backoff
- **Server Errors (5xx)**: Retry on temporary failures
- **Max Retries**: 2 attempts with intelligent backoff

### Continue on Fail
When **Continue on Fail** is enabled:
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "itemIndex": 0
}
```

### Common Error Types
- **Authentication**: Invalid API key or missing credentials
- **Rate Limiting**: Too many requests, automatic retry engaged
- **Network**: Connection issues, DNS resolution failures
- **Validation**: Invalid parameters or malformed requests

## 🤖 AI Agent Integration

This node is marked as `usableAsTool: true`, making it available in n8n AI Agents:

1. Create an **AI Agent** workflow
2. In the Agent configuration, the **NEURA | IANUSTEC AI** node will appear in available tools
3. The Agent can automatically call this node for AI completions

## 🔧 Development

### Building
```bash
pnpm install
pnpm build
```

### Linting
```bash
pnpm lint
pnpm lintfix
```

### Testing
```bash
# Build and test locally
pnpm build
# Import the built node into your n8n instance for testing
```

## 📋 Requirements

- **Node.js**: >= 18.0.0
- **n8n**: >= 1.0.0
- **Package Manager**: pnpm (recommended)

## 🔍 Troubleshooting

### Connection Issues
1. **Verify Base URL**: Ensure the endpoint is accessible
2. **Check API Key**: Validate authentication credentials
3. **Network Access**: Confirm n8n can reach the API endpoint
4. **SSL Issues**: Disable `rejectUnauthorized` for self-signed certificates

### Performance Optimization
1. **Batch Size**: Process items in reasonable batches
2. **Timeout Settings**: Adjust timeout for your network conditions
3. **Rate Limiting**: Monitor API usage and implement delays if needed

### Debug Mode
Enable debug logging in n8n to see detailed request/response information:
```bash
N8N_LOG_LEVEL=debug n8n start
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ianustec/n8n-nodes-neura-ianustec/issues)
- **Documentation**: [IANUSTEC Docs](https://ianustec.com/docs)
- **Community**: [n8n Community](https://community.n8n.io)

## 🏷️ Version History

- **v0.1.0**: Initial release with Chat Completions and Embeddings support

---

**Made with ❤️ by [IANUSTEC](https://ianustec.com)**
