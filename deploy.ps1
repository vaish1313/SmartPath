# SmartPath Deployment Script (PowerShell)
# This script helps deploy SmartPath using Docker

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SmartPath - Docker Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
}

# Check if Docker Compose is installed
try {
    docker compose version | Out-Null
    Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Compose"
    exit 1
}

Write-Host ""

# Ask deployment type
Write-Host "Select deployment type:"
Write-Host "1) Development (local)"
Write-Host "2) Production"
$deployType = Read-Host "Enter choice [1-2]"

if ($deployType -eq "1") {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Starting Development Environment" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Start infrastructure
    Set-Location infrastructure/docker
    docker compose up -d
    Set-Location ../..
    
    Write-Host ""
    Write-Host "✅ Development environment started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services:"
    Write-Host "- MongoDB: localhost:27017"
    Write-Host "- Redis: localhost:6379"
    Write-Host "- Mongo Express: http://localhost:8082"
    Write-Host "- Redis Commander: http://localhost:8081"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Run 'npm run dev' in project root"
    Write-Host "2. Access frontend at http://localhost:3000"
    Write-Host ""
    
} elseif ($deployType -eq "2") {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Production Deployment" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check if .env.production exists
    if (-not (Test-Path ".env.production")) {
        Write-Host "⚠️  .env.production not found" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Creating .env.production from template..."
        
        @"
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
"@ | Out-File -FilePath ".env.production" -Encoding UTF8
        
        Write-Host "⚠️  Please edit .env.production and update all values" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter after updating .env.production"
    }
    
    # Build images
    Write-Host ""
    Write-Host "Building Docker images..."
    docker compose -f docker-compose.prod.yml build
    
    # Start services
    Write-Host ""
    Write-Host "Starting services..."
    docker compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    Write-Host ""
    Write-Host "Waiting for services to be healthy..."
    Start-Sleep -Seconds 10
    
    # Check health
    Write-Host ""
    Write-Host "Checking service health..."
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Patient Service is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Patient Service is not responding" -ForegroundColor Red
    }
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Booking Service is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Booking Service is not responding" -ForegroundColor Red
    }
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Frontend is not responding" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "✅ Production deployment complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services:"
    Write-Host "- Frontend: http://localhost:3000"
    Write-Host "- Patient Service: http://localhost:3001"
    Write-Host "- Booking Service: http://localhost:3002"
    Write-Host ""
    Write-Host "View logs:"
    Write-Host "docker compose -f docker-compose.prod.yml logs -f"
    Write-Host ""
    
} else {
    Write-Host "Invalid choice" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
