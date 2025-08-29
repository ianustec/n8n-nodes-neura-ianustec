# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-15

### Added
- Initial release of NEURA | IANUSTEC AI n8n Community Node
- OpenAI-compatible API integration with configurable base URL
- Chat Completions endpoint with full message support (system, user, assistant, tool, function)
- Embeddings endpoint for single text and array inputs
- Tool/function calling pass-through support
- Advanced error handling with retry logic and exponential backoff
- Binary output functionality for raw JSON responses
- Batch processing with proper error isolation
- `usableAsTool: true` configuration for AI Agent integration
- Comprehensive parameter validation and schema enforcement
- Support for temperature, top_p, max_tokens, and other OpenAI parameters
- Configurable credentials with base URL, API key, organization, timeout, and SSL settings

### Features
- **Chat Completions**: Generate AI responses with system/user messages, temperature control, and tool calling
- **Embeddings**: Create vector embeddings for text inputs (strings or arrays)
- **Tool Integration**: Usable as a Tool in n8n AI Agents
- **Error Handling**: Retry logic with exponential backoff for rate limits and timeouts
- **Binary Output**: Save raw API responses as JSON files
- **Batch Processing**: Process multiple items efficiently with proper error isolation
- **Configurable Endpoints**: Support for OpenAI, LiteLLM, vLLM, and other compatible APIs

### Technical Details
- Built with TypeScript and follows n8n Community Node standards
- Programmatic style implementation with custom execute() method
- Uses n8n's native `this.helpers.httpRequest` for HTTP operations
- Comprehensive type definitions for OpenAI API compatibility
- Proper ESLint and Prettier configuration
- Full test workflow included for validation

### Compatibility
- Node.js >= 18.0.0
- n8n >= 1.0.0
- OpenAI API v1 compatible endpoints
- LiteLLM, vLLM, and other OpenAI-compatible services
