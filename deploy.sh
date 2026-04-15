#!/bin/bash

# SmartPath Deployment Script
# This script helps deploy SmartPath using Docker

set -e

echo "=========================================="
echo "SmartPath - Docker Deployment"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose is installed${NC}"
echo ""

# Ask deployment type
echo "Select deployment type:"
echo "1) Development (local)"
echo "2) Production"
read -p "Enter choice [1-2]: " deploy_type

if [ "$deploy_type" = "1" ]; then
    echo ""
    echo "=========================================="
    echo "Starting Development Environment"
    echo "=========================================="
    echo ""
    
    # Start infrastructure
    cd infrastructure/docker
    docker compose up -d
    
    echo ""
    echo -e "${GREEN}✅ Development environment started!${NC}"
    echo ""
    echo "Services:"
    echo "- MongoDB: localhost:27017"
    echo "- Redis: localhost:6379"
    echo "- Mongo Express: http://localhost:8082"
    echo "- Redis Commander: http://localhost:8081"
    echo ""
    echo "Next steps:"
    echo "1. Run 'npm run dev' in project root"
    echo "2. Access frontend at http://localhost:3000"
    echo ""
    
elif [ "$deploy_type" = "2" ]; then
    echo ""
    echo "=========================================="
    echo "Production Deployment"
    echo "=========================================="
    echo ""
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        echo -e "${YELLOW}⚠️  .env.production not found${NC}"
        echo ""
        echo "Creating .env.production from template..."
        
        cat > .env.production << 'EOF'
# Node Environment
NODE_ENV=production

# MongoDB
MONGO_USERNAME=admin
MONGO_PASSWORD=CHANGE_THIS_PASSWORD

# Redis
REDIS_PASSWORD=CHANGE_THIS_PASSWORD

# JWT
JWT_SECRET=CHANGE_THIS_SECRET
JWT_EXPIRES_IN=7d

# Google Cloud Vision API
GOOGLE_VISION_API_KEY=YOUR_API_KEY_HERE

# Razorpay
RAZORPAY_KEY_ID=YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_SECRET

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=CHANGE_THIS_SECRET

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
EOF
        
        echo -e "${YELLOW}⚠️  Please edit .env.production and update all values${NC}"
        echo ""
        read -p "Press Enter after updating .env.production..."
    fi
    
    # Load environment variables
    export $(cat .env.production | grep -v '^#' | xargs)
    
    # Build images
    echo ""
    echo "Building Docker images..."
    docker compose -f docker-compose.prod.yml build
    
    # Start services
    echo ""
    echo "Starting services..."
    docker compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    echo ""
    echo "Waiting for services to be healthy..."
    sleep 10
    
    # Check health
    echo ""
    echo "Checking service health..."
    
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Patient Service is healthy${NC}"
    else
        echo -e "${RED}❌ Patient Service is not responding${NC}"
    fi
    
    if curl -f http://localhost:3002/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Booking Service is healthy${NC}"
    else
        echo -e "${RED}❌ Booking Service is not responding${NC}"
    fi
    
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is healthy${NC}"
    else
        echo -e "${RED}❌ Frontend is not responding${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Production deployment complete!${NC}"
    echo ""
    echo "Services:"
    echo "- Frontend: http://localhost:3000"
    echo "- Patient Service: http://localhost:3001"
    echo "- Booking Service: http://localhost:3002"
    echo ""
    echo "View logs:"
    echo "docker compose -f docker-compose.prod.yml logs -f"
    echo ""
    
else
    echo -e "${RED}Invalid choice${NC}"
    exit 1
fi

echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
