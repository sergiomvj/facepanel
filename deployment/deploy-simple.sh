#!/bin/bash

# PanelX Simple Deployment Script
# Just run this script and it will deploy everything!

set -e

echo "🚀 Starting PanelX deployment..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the deployment directory"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p storage/{uploads,logs,backups,ssl}
chmod -R 755 storage/

# Create simple .env file
echo "📝 Creating environment file..."
cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./database/custom.db
JWT_SECRET=panelx-secret-key-$(date +%s)
NEXTAUTH_SECRET=nextauth-secret-key-$(date +%s)
NEXTAUTH_URL=http://localhost:3000
DOCKER_HOST=unix:///var/run/docker.sock
EOF

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start
echo "🏗️  Building and starting services..."
docker-compose build --no-cache
docker-compose up -d

# Wait a bit
echo "⏳ Waiting for services to start..."
sleep 20

# Check if it's working
echo "🔍 Checking services..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Admin Panel is running!"
    echo "🌐 Access: http://localhost:3000"
else
    echo "⚠️  Admin Panel might still be starting..."
    echo "   Check logs: docker-compose logs admin-panel"
fi

echo "🎉 Deployment completed!"
echo ""
echo "📊 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop: docker-compose down"
echo "   Restart: docker-compose restart"
echo "   Status: docker-compose ps"