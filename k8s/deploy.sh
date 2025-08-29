#!/bin/bash

# NEURA | IANUSTEC AI Node Installer - Kubernetes Deployment Script
# =================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="${NAMESPACE:-lair}"
KUBECTL_CONTEXT="${KUBECTL_CONTEXT:-}"
DRY_RUN="${DRY_RUN:-false}"
WAIT_FOR_COMPLETION="${WAIT_FOR_COMPLETION:-true}"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🚀 NEURA | IANUSTEC AI Node Installer - Kubernetes Deployment${NC}"
echo -e "${BLUE}=============================================================${NC}"
echo ""

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to run kubectl with optional context
run_kubectl() {
    local cmd="kubectl"
    if [[ -n "${KUBECTL_CONTEXT}" ]]; then
        cmd="kubectl --context=${KUBECTL_CONTEXT}"
    fi
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        cmd="${cmd} --dry-run=client"
    fi
    
    eval "${cmd} $*"
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_status "${RED}" "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we can connect to the cluster
print_status "${BLUE}" "🔍 Checking Kubernetes cluster connectivity..."
if ! run_kubectl cluster-info &> /dev/null; then
    print_status "${RED}" "❌ Cannot connect to Kubernetes cluster"
    print_status "${YELLOW}" "   Please check your kubeconfig and cluster connectivity"
    exit 1
fi

print_status "${GREEN}" "✅ Connected to Kubernetes cluster"

# Display configuration
print_status "${BLUE}" "📋 Configuration:"
echo "   - Namespace: ${NAMESPACE}"
echo "   - Kubectl Context: ${KUBECTL_CONTEXT:-default}"
echo "   - Dry Run: ${DRY_RUN}"
echo "   - Wait for Completion: ${WAIT_FOR_COMPLETION}"
echo ""

# Create namespace and RBAC
print_status "${BLUE}" "🔧 Applying namespace and RBAC configuration..."
if run_kubectl apply -f "${SCRIPT_DIR}/namespace.yaml"; then
    print_status "${GREEN}" "✅ Namespace and RBAC applied successfully"
else
    print_status "${RED}" "❌ Failed to apply namespace and RBAC"
    exit 1
fi

# Apply ConfigMap
print_status "${BLUE}" "📜 Applying ConfigMap with installation script..."
if run_kubectl apply -f "${SCRIPT_DIR}/configmap.yaml"; then
    print_status "${GREEN}" "✅ ConfigMap applied successfully"
else
    print_status "${RED}" "❌ Failed to apply ConfigMap"
    exit 1
fi

# Check if job already exists and delete it if needed
JOB_NAME="n8n-neura-ianustec-node-installer"
if run_kubectl get job "${JOB_NAME}" -n "${NAMESPACE}" &> /dev/null; then
    print_status "${YELLOW}" "⚠️  Job ${JOB_NAME} already exists, deleting it..."
    if run_kubectl delete job "${JOB_NAME}" -n "${NAMESPACE}" --ignore-not-found=true; then
        print_status "${GREEN}" "✅ Existing job deleted"
        
        # Wait a moment for cleanup
        sleep 2
    else
        print_status "${RED}" "❌ Failed to delete existing job"
        exit 1
    fi
fi

# Apply Job
print_status "${BLUE}" "🚀 Deploying node installer job..."
if run_kubectl apply -f "${SCRIPT_DIR}/job.yaml"; then
    print_status "${GREEN}" "✅ Job deployed successfully"
else
    print_status "${RED}" "❌ Failed to deploy job"
    exit 1
fi

# Exit here if dry run
if [[ "${DRY_RUN}" == "true" ]]; then
    print_status "${YELLOW}" "🔍 Dry run completed - no resources were actually created"
    exit 0
fi

# Wait for job completion if requested
if [[ "${WAIT_FOR_COMPLETION}" == "true" ]]; then
    print_status "${BLUE}" "⏳ Waiting for job completion..."
    echo ""
    
    # Wait for job to complete (max 10 minutes)
    if run_kubectl wait --for=condition=complete job/"${JOB_NAME}" -n "${NAMESPACE}" --timeout=600s; then
        print_status "${GREEN}" "🎉 Job completed successfully!"
        
        # Show job logs
        print_status "${BLUE}" "📋 Job logs:"
        echo ""
        run_kubectl logs job/"${JOB_NAME}" -n "${NAMESPACE}" || true
        
    else
        print_status "${RED}" "❌ Job failed or timed out"
        
        # Show job status and logs for debugging
        print_status "${YELLOW}" "🔍 Job status:"
        run_kubectl describe job "${JOB_NAME}" -n "${NAMESPACE}" || true
        
        print_status "${YELLOW}" "📋 Job logs:"
        run_kubectl logs job/"${JOB_NAME}" -n "${NAMESPACE}" || true
        
        exit 1
    fi
else
    print_status "${YELLOW}" "ℹ️  Job deployed, not waiting for completion"
    print_status "${BLUE}" "   Monitor with: kubectl logs -f job/${JOB_NAME} -n ${NAMESPACE}"
fi

echo ""
print_status "${GREEN}" "🎊 NEURA | IANUSTEC AI Node Installer deployment completed!"
print_status "${BLUE}" "============================================================"
echo ""
print_status "${BLUE}" "📋 Next steps:"
echo "   1. Monitor the job: kubectl get jobs -n ${NAMESPACE}"
echo "   2. Check logs: kubectl logs job/${JOB_NAME} -n ${NAMESPACE}"
echo "   3. Install the node in n8n UI: Settings → Community Nodes → n8n-nodes-neura-ianustec"
echo ""
print_status "${BLUE}" "🔗 Documentation: https://github.com/ianustec/n8n-nodes-neura-ianustec"
echo ""
print_status "${GREEN}" "✨ Happy Automating with NEURA | IANUSTEC AI! ✨"
