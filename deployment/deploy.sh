#!/bin/bash

# PanelX Deployment Script
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_ROOT=$(pwd)
DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"

echo "🚀 Starting PanelX deployment for $ENVIRONMENT environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p "$DEPLOYMENT_DIR/storage/uploads"
mkdir -p "$DEPLOYMENT_DIR/storage/logs"
mkdir -p "$DEPLOYMENT_DIR/storage/backups"
mkdir -p "$DEPLOYMENT_DIR/storage/ssl"

# Set permissions
chmod -R 755 "$DEPLOYMENT_DIR/storage"
chmod -R 755 "$DEPLOYMENT_DIR/database"

# Copy environment file if it doesn't exist
if [ ! -f "$DEPLOYMENT_DIR/.env" ]; then
    echo "📝 Creating environment file..."
    cat > "$DEPLOYMENT_DIR/.env" << EOF
# PanelX Environment Configuration
NODE_ENV=$ENVIRONMENT
PORT=3000
API_PORT=3001
DATABASE_URL=file:./database/custom.db

# JWT Secret (generate a new one for production)
JWT_SECRET=$(openssl rand -hex 32)

# NextAuth Secret (generate a new one for production)
NEXTAUTH_SECRET=$(openssl rand -hex 32)
NEXTAUTH_URL=http://localhost:3000

# Docker-specific settings
DOCKER_HOST=unix:///var/run/docker.sock

# Logging
LOG_LEVEL=info
LOG_DIR=./storage/logs
EOF
fi

# Build and start services
echo "🏗️  Building and starting services..."
cd "$DEPLOYMENT_DIR"

# Stop existing containers
docker-compose down

# Build images
docker-compose build --no-cache

# Start services
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check admin panel
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Admin Panel is running on http://localhost:3000"
else
    echo "❌ Admin Panel failed to start"
fi

# Check API
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ API is running on http://localhost:3001"
else
    echo "❌ API failed to start"
fi

# Run database migrations if needed
echo "🗄️  Running database migrations..."
docker-compose exec admin-panel npx prisma db push

# Create initial admin user (optional)
echo "👤 Creating initial admin user..."
docker-compose exec admin-panel npx prisma db seed || echo "Seed script not found, skipping..."

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Access URLs:"
echo "   Admin Panel: http://localhost:3000"
echo "   API: http://localhost:3001"
echo "   API Health: http://localhost:3001/health"
echo ""
echo "📊 To view logs: docker-compose logs -f [service]"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"