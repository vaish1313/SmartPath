# SmartPath - Docker Deployment Guide

Complete guide to deploy SmartPath using Docker and Docker Compose.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development with Docker](#local-development-with-docker)
4. [Production Deployment](#production-deployment)
5. [Cloud Deployment Options](#cloud-deployment-options)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**

### Install Docker

**Windows:**
```powershell
# Download and install Docker Desktop
# https://www.docker.com/products/docker-desktop/
```

**Linux (Ubuntu/Debian):**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

**macOS:**
```bash
# Download and install Docker Desktop
# https://www.docker.com/products/docker-desktop/
```

### Verify Installation

```bash
docker --version
docker compose version
```

---

## Environment Setup

### 1. Create Production Environment File

Create `.env.production` in the project root:

```env
# Node Environment
NODE_ENV=production

# MongoDB
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_mongodb_password_here

# Redis
REDIS_PASSWORD=your_secure_redis_password_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Google Cloud Vision API
GOOGLE_VISION_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Razorpay
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_change_this

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. Security Checklist

- [ ] Change all default passwords
- [ ] Use strong, unique passwords (min 32 characters)
- [ ] Never commit `.env.production` to Git
- [ ] Use environment-specific API keys
- [ ] Enable 2FA on cloud accounts
- [ ] Rotate secrets regularly

---

## Local Development with Docker

### Start Development Environment

```bash
# Start infrastructure (MongoDB, Redis, etc.)
cd infrastructure/docker
docker compose up -d

# Verify services are running
docker compose ps

# View logs
docker compose logs -f
```

### Access Development Services

- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`
- **Mongo Express**: http://localhost:8082
- **Redis Commander**: http://localhost:8081

### Stop Development Environment

```bash
cd infrastructure/docker
docker compose down

# Stop and remove volumes (WARNING: Deletes all data)
docker compose down -v
```

---

## Production Deployment

### Option 1: Single Server Deployment

#### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Create app directory
sudo mkdir -p /opt/smartpath
cd /opt/smartpath
```

#### Step 2: Clone Repository

```bash
# Clone your repository
git clone https://github.com/your-org/smartpath.git .

# Or upload files via SCP/SFTP
```

#### Step 3: Configure Environment

```bash
# Copy and edit production environment
cp .env.production.example .env.production
nano .env.production

# Set proper permissions
chmod 600 .env.production
```

#### Step 4: Build and Start Services

```bash
# Build Docker images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

#### Step 5: Verify Deployment

```bash
# Check health endpoints
curl http://localhost:3001/health  # Patient Service
curl http://localhost:3002/health  # Booking Service
curl http://localhost:3000         # Frontend

# Check MongoDB connection
docker exec smartpath-mongodb mongosh -u admin -p your_password --eval "db.adminCommand('ping')"

# Check Redis connection
docker exec smartpath-redis redis-cli -a your_password ping
```

#### Step 6: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

### Option 2: Docker Swarm (Multi-Server)

#### Initialize Swarm

```bash
# On manager node
docker swarm init --advertise-addr <MANAGER-IP>

# On worker nodes (use token from init output)
docker swarm join --token <TOKEN> <MANAGER-IP>:2377
```

#### Deploy Stack

```bash
# Deploy services
docker stack deploy -c docker-compose.prod.yml smartpath

# Check services
docker stack services smartpath

# View logs
docker service logs smartpath_frontend
```

---

## Cloud Deployment Options

### AWS (Amazon Web Services)

#### Option A: AWS ECS (Elastic Container Service)

**Pros:**
- Fully managed
- Auto-scaling
- Load balancing
- Good for production

**Steps:**
1. Create ECR repositories for each service
2. Push Docker images to ECR
3. Create ECS cluster
4. Define task definitions
5. Create services
6. Configure ALB (Application Load Balancer)

**Estimated Cost:** $50-200/month

#### Option B: AWS EC2 + Docker

**Pros:**
- Full control
- Cost-effective
- Simple setup

**Steps:**
1. Launch EC2 instance (t3.medium or larger)
2. Install Docker
3. Clone repository
4. Run docker-compose

**Estimated Cost:** $30-100/month

#### Option C: AWS Lightsail

**Pros:**
- Simplest AWS option
- Fixed pricing
- Good for small deployments

**Steps:**
1. Create Lightsail instance
2. Install Docker
3. Deploy with docker-compose

**Estimated Cost:** $20-40/month

---

### Google Cloud Platform (GCP)

#### Option A: Google Cloud Run

**Pros:**
- Serverless
- Pay per use
- Auto-scaling
- Easy deployment

**Steps:**
```bash
# Build and push images
gcloud builds submit --tag gcr.io/PROJECT_ID/smartpath-frontend
gcloud builds submit --tag gcr.io/PROJECT_ID/smartpath-patient-service
gcloud builds submit --tag gcr.io/PROJECT_ID/smartpath-booking-service

# Deploy services
gcloud run deploy smartpath-frontend --image gcr.io/PROJECT_ID/smartpath-frontend
gcloud run deploy smartpath-patient --image gcr.io/PROJECT_ID/smartpath-patient-service
gcloud run deploy smartpath-booking --image gcr.io/PROJECT_ID/smartpath-booking-service
```

**Estimated Cost:** $10-50/month

#### Option B: Google Compute Engine

**Steps:**
1. Create VM instance
2. Install Docker
3. Deploy with docker-compose

**Estimated Cost:** $25-80/month

---

### DigitalOcean

#### Option A: App Platform

**Pros:**
- Easiest deployment
- Managed databases
- Auto-scaling
- CI/CD built-in

**Steps:**
1. Connect GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

**Estimated Cost:** $30-100/month

#### Option B: Droplets + Docker

**Steps:**
1. Create Droplet (4GB RAM minimum)
2. Install Docker
3. Deploy with docker-compose

**Estimated Cost:** $24-48/month

---

### Heroku

**Pros:**
- Simplest deployment
- Free tier available
- Good for testing

**Steps:**
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create apps
heroku create smartpath-frontend
heroku create smartpath-patient-service
heroku create smartpath-booking-service

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Deploy
git push heroku main
```

**Estimated Cost:** $0-50/month

---

### Azure

#### Azure Container Instances

**Steps:**
1. Create resource group
2. Create container registry
3. Push images
4. Deploy containers

**Estimated Cost:** $30-100/month

---

## Recommended Deployment Strategy

### For Small Clinics (< 100 patients/day)
**Recommended:** DigitalOcean Droplet or AWS Lightsail
- **Cost:** $24-40/month
- **Setup Time:** 1-2 hours
- **Maintenance:** Low

### For Medium Clinics (100-500 patients/day)
**Recommended:** AWS ECS or GCP Cloud Run
- **Cost:** $50-150/month
- **Setup Time:** 2-4 hours
- **Maintenance:** Medium

### For Large Hospitals (500+ patients/day)
**Recommended:** AWS ECS with Auto-scaling or Kubernetes
- **Cost:** $200-500/month
- **Setup Time:** 4-8 hours
- **Maintenance:** High

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check all services
docker compose -f docker-compose.prod.yml ps

# Check specific service
docker compose -f docker-compose.prod.yml logs frontend

# Check resource usage
docker stats
```

### Backup Database

```bash
# Backup MongoDB
docker exec smartpath-mongodb mongodump \
  --username admin \
  --password your_password \
  --authenticationDatabase admin \
  --out /backups/$(date +%Y%m%d)

# Copy backup to host
docker cp smartpath-mongodb:/backups ./backups

# Backup to S3 (optional)
aws s3 sync ./backups s3://your-bucket/smartpath-backups/
```

### Restore Database

```bash
# Restore MongoDB
docker exec smartpath-mongodb mongorestore \
  --username admin \
  --password your_password \
  --authenticationDatabase admin \
  /backups/20260415
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker compose -f docker-compose.prod.yml build

# Restart services (zero-downtime)
docker compose -f docker-compose.prod.yml up -d --no-deps --build frontend
docker compose -f docker-compose.prod.yml up -d --no-deps --build patient-service
docker compose -f docker-compose.prod.yml up -d --no-deps --build booking-service
```

### Log Management

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f frontend

# Save logs to file
docker compose -f docker-compose.prod.yml logs > logs.txt

# Rotate logs (add to crontab)
docker system prune -f
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check specific service
docker logs smartpath-frontend

# Restart service
docker compose -f docker-compose.prod.yml restart frontend
```

### Database Connection Issues

```bash
# Check MongoDB is running
docker exec smartpath-mongodb mongosh -u admin -p your_password --eval "db.adminCommand('ping')"

# Check network
docker network inspect smartpath-network

# Restart MongoDB
docker compose -f docker-compose.prod.yml restart mongodb
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory

# Add swap space (Linux)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose
```

---

## Security Best Practices

### 1. Use Secrets Management

```bash
# Docker secrets (Swarm mode)
echo "your_secret" | docker secret create jwt_secret -

# Use in compose file
secrets:
  jwt_secret:
    external: true
```

### 2. Enable Firewall

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Regular Updates

```bash
# Update Docker images
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Update system
sudo apt update && sudo apt upgrade -y
```

### 4. Monitor Logs

```bash
# Setup log monitoring
docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions
```

---

## Cost Optimization

### 1. Use Multi-stage Builds
Already implemented in Dockerfiles

### 2. Optimize Images
```bash
# Remove unused images
docker image prune -a

# Use alpine base images
# Already using node:20-alpine
```

### 3. Resource Limits
```yaml
# Add to docker-compose.prod.yml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

---

## Support

- **Documentation**: See other .md files
- **Email**: hello@padc.in
- **Docker Docs**: https://docs.docker.com/

---

**Last Updated**: April 2026
