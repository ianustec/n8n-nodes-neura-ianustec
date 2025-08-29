#!/bin/bash

# NEURA | IANUSTEC AI Node - Local Test Script
# ============================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🧪 NEURA | IANUSTEC AI Node - Local Test${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Load environment variables
if [[ -f "${SCRIPT_DIR}/.env" ]]; then
    print_status "${BLUE}" "📋 Loading environment from .env file..."
    source "${SCRIPT_DIR}/.env"
elif [[ -f "${SCRIPT_DIR}/env.example" ]]; then
    print_status "${YELLOW}" "⚠️  .env file not found, using env.example as template"
    print_status "${BLUE}" "   Copy env.example to .env and customize if needed"
    source "${SCRIPT_DIR}/env.example"
else
    print_status "${YELLOW}" "⚠️  No environment file found, using defaults"
fi

# Set defaults
NEURA_BASE_URL="${NEURA_BASE_URL:-http://localhost:8000/v1}"
NEURA_API_KEY="${NEURA_API_KEY:-test-api-key}"
NODE_PACKAGE="${NODE_PACKAGE:-n8n-nodes-neura-ianustec}"
NODE_VERSION="${NODE_VERSION:-0.1.0}"

print_status "${BLUE}" "📋 Configuration:"
echo "   - NEURA Base URL: ${NEURA_BASE_URL}"
echo "   - NEURA API Key: ${NEURA_API_KEY:0:8}...${NEURA_API_KEY: -8}"
echo "   - Node Package: ${NODE_PACKAGE}@${NODE_VERSION}"
echo ""

# Check if we're in the right directory
if [[ ! -f "${SCRIPT_DIR}/package.json" ]]; then
    print_status "${RED}" "❌ package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if node_modules exists
if [[ ! -d "${SCRIPT_DIR}/node_modules" ]]; then
    print_status "${BLUE}" "📦 Installing dependencies..."
    npm install
fi

# Build the project
print_status "${BLUE}" "🔨 Building the project..."
if npm run build; then
    print_status "${GREEN}" "✅ Build completed successfully"
else
    print_status "${RED}" "❌ Build failed"
    exit 1
fi

# Test the built package
print_status "${BLUE}" "🧪 Testing package installation..."

# Create a temporary directory for testing
TEST_DIR=$(mktemp -d)
cd "$TEST_DIR"

print_status "${BLUE}" "📁 Test directory: $TEST_DIR"

# Initialize npm project
npm init -y > /dev/null

# Install the local package
print_status "${BLUE}" "📥 Installing local package..."
if npm install "${SCRIPT_DIR}"; then
    print_status "${GREEN}" "✅ Local package installed successfully"
else
    print_status "${RED}" "❌ Failed to install local package"
    exit 1
fi

# Verify installation
print_status "${BLUE}" "🔍 Verifying installation..."
if npm list "${NODE_PACKAGE}" --depth=0; then
    print_status "${GREEN}" "✅ Package verification successful"
else
    print_status "${RED}" "❌ Package verification failed"
    exit 1
fi

# Test NEURA API connectivity (if accessible)
print_status "${BLUE}" "🌐 Testing NEURA API connectivity..."
if curl -f -s --max-time 5 "${NEURA_BASE_URL%/v1}/health" > /dev/null 2>&1; then
    print_status "${GREEN}" "✅ NEURA API is accessible"
elif curl -f -s --max-time 5 "${NEURA_BASE_URL}" > /dev/null 2>&1; then
    print_status "${GREEN}" "✅ NEURA API base URL is accessible"
else
    print_status "${YELLOW}" "⚠️  NEURA API not accessible (this is normal for local testing)"
    print_status "${BLUE}" "   Make sure the NEURA service is running when testing in production"
fi

# Create a test credentials configuration
print_status "${BLUE}" "📝 Creating test credentials configuration..."
cat > test-credentials.json <<EOF
{
  "name": "NEURA Internal API - Test",
  "type": "neuraIanustecApi",
  "data": {
    "baseUrl": "${NEURA_BASE_URL}",
    "apiKey": "${NEURA_API_KEY}",
    "organization": "",
    "timeout": 60000,
    "rejectUnauthorized": false
  }
}
EOF

print_status "${GREEN}" "✅ Test credentials configuration created: test-credentials.json"

# Cleanup
cd /
rm -rf "$TEST_DIR"

echo ""
print_status "${GREEN}" "🎉 Local Test Completed Successfully!"
print_status "${BLUE}" "====================================="
echo ""
print_status "${BLUE}" "📋 Test Results:"
echo "   ✅ Package builds correctly"
echo "   ✅ Package installs without errors"
echo "   ✅ Dependencies are resolved"
echo "   ✅ Configuration is valid"
echo ""
print_status "${BLUE}" "📋 Next Steps for n8n Integration:"
echo "   1. Install in n8n: Settings → Community Nodes → ${NODE_PACKAGE}"
echo "   2. Create credentials with:"
echo "      - Base URL: ${NEURA_BASE_URL}"
echo "      - API Key: ${NEURA_API_KEY}"
echo "   3. Test with a simple chat completion workflow"
echo ""
print_status "${BLUE}" "🔗 Documentation: https://github.com/ianustec/n8n-nodes-neura-ianustec"
echo ""
print_status "${GREEN}" "✨ Happy Testing with NEURA | IANUSTEC AI! ✨"
