#!/bin/bash

# TrustLens Cross-Chain Sync Service Deployment Script

set -e

echo "🚀 Deploying TrustLens Cross-Chain Sync Service..."

# Configuration
SERVICE_NAME="trustlens-cross-chain-sync"
DOCKER_IMAGE="trustlens-cross-chain-sync"
CONTAINER_NAME="trustlens-sync"
PORT=${PORT:-3003}
NETWORK=${NETWORK:-trustlens-network}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        log_warning ".env file not found. Creating from template..."
        if [ -f env.example ]; then
            cp env.example .env
            log_warning "Please edit .env file with your configuration before continuing."
            read -p "Press Enter to continue after editing .env file..."
        else
            log_error "env.example file not found. Please create .env file manually."
            exit 1
        fi
    fi
    
    log_success "Prerequisites check passed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    if docker build -t $DOCKER_IMAGE .; then
        log_success "Docker image built successfully"
    else
        log_error "Failed to build Docker image"
        exit 1
    fi
}

# Stop existing container
stop_existing() {
    log_info "Stopping existing container..."
    
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME
        log_success "Existing container stopped"
    else
        log_info "No existing container found"
    fi
    
    if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        docker rm $CONTAINER_NAME
        log_success "Existing container removed"
    fi
}

# Create network if it doesn't exist
create_network() {
    log_info "Creating Docker network..."
    
    if ! docker network ls | grep -q $NETWORK; then
        docker network create $NETWORK
        log_success "Docker network '$NETWORK' created"
    else
        log_info "Docker network '$NETWORK' already exists"
    fi
}

# Deploy with docker-compose
deploy_compose() {
    log_info "Deploying with Docker Compose..."
    
    # Load environment variables
    set -a
    source .env
    set +a
    
    # Start services
    if docker-compose up -d; then
        log_success "Services deployed successfully with Docker Compose"
    else
        log_error "Failed to deploy with Docker Compose"
        exit 1
    fi
}

# Deploy with Docker run
deploy_docker() {
    log_info "Deploying with Docker run..."
    
    # Load environment variables
    set -a
    source .env
    set +a
    
    # Create logs directory
    mkdir -p logs
    
    # Run container
    docker run -d \
        --name $CONTAINER_NAME \
        --network $NETWORK \
        -p $PORT:3003 \
        -v $(pwd)/logs:/app/logs \
        --env-file .env \
        --restart unless-stopped \
        $DOCKER_IMAGE
    
    if [ $? -eq 0 ]; then
        log_success "Container deployed successfully"
    else
        log_error "Failed to deploy container"
        exit 1
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for service to start
    sleep 10
    
    # Check if service is responding
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:$PORT/health &> /dev/null; then
            log_success "Health check passed"
            return 0
        fi
        
        log_info "Health check attempt $attempt/$max_attempts..."
        sleep 5
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    echo ""
    
    # Show container status
    if docker ps -f name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"; then
        echo ""
    fi
    
    # Show service info
    echo "🌐 Service URL: http://localhost:$PORT"
    echo "🏥 Health Check: http://localhost:$PORT/health"
    echo "📊 Metrics: http://localhost:$PORT/metrics"
    echo ""
    
    # Show logs command
    echo "📋 Useful Commands:"
    echo "  View logs: docker logs -f $CONTAINER_NAME"
    echo "  Stop service: docker stop $CONTAINER_NAME"
    echo "  Restart service: docker restart $CONTAINER_NAME"
    echo "  Remove service: docker rm -f $CONTAINER_NAME"
    echo ""
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Stop and remove container
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME
    fi
    
    if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        docker rm $CONTAINER_NAME
    fi
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    echo "🚀 TrustLens Cross-Chain Sync Service Deployment"
    echo "================================================"
    echo ""
    
    # Check command line arguments
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            build_image
            stop_existing
            create_network
            
            # Choose deployment method
            if [ -f docker-compose.yml ]; then
                deploy_compose
            else
                deploy_docker
            fi
            
            if health_check; then
                show_status
                log_success "Deployment completed successfully!"
            else
                log_error "Deployment failed health check"
                exit 1
            fi
            ;;
        "stop")
            log_info "Stopping service..."
            stop_existing
            log_success "Service stopped"
            ;;
        "restart")
            log_info "Restarting service..."
            stop_existing
            build_image
            create_network
            deploy_docker
            health_check
            show_status
            log_success "Service restarted"
            ;;
        "cleanup")
            cleanup
            ;;
        "status")
            show_status
            ;;
        "logs")
            docker logs -f $CONTAINER_NAME
            ;;
        *)
            echo "Usage: $0 {deploy|stop|restart|cleanup|status|logs}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Deploy the service (default)"
            echo "  stop     - Stop the service"
            echo "  restart  - Restart the service"
            echo "  cleanup  - Stop and remove the service"
            echo "  status   - Show deployment status"
            echo "  logs     - View service logs"
            exit 1
            ;;
    esac
}

# Handle script interruption
trap cleanup EXIT INT TERM

# Run main function
main "$@"
