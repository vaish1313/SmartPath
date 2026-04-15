# SmartPath - Docker Deployment Summary

## ✅ What's Been Created

### Docker Configuration Files

1. **`services/patient-service/Dockerfile`**
   - Node.js 20 Alpine base
   - Production-optimized
   - Health checks included
   - Uploads directory created

2. **`services/booking-service/Dockerfile`**
   - Node.js 20 Alpine base
   - Production-optimized
   - Health checks included
   - Uploads directories created

3. **`apps/web/Dockerfile`**
   - Multi-stage build (deps → builder → runner)
   - Next.js standalone output
   - Optimized for production
   - Non-root user for security

4. **`docker-compose.prod.yml`**
   - Complete production stack
   - MongoDB + Redis + Services + Frontend + Nginx
   - Health checks for all services
   - Volume management
   - Network isolation

5. **`infrastructure/docker/docker-compose.yml`** (Already existed)
   - Development infrastructure
   - MongoDB, Redis, Postgres
   - Admin UIs (Mongo Express, Redis Commander)

### Deployment Scripts

6. **`deploy.sh`** (Linux/Mac)
   - Automated deployment
   - Environment validation
   - Health checks
   - Color-coded output

7. **`deploy.ps1`** (Windows)
   - PowerShell deployment script
   - Same features as bash version
   - Windows-compatible

### Documentation

8. **`DEPLOYMENT_GUIDE.md`**
   - Complete deployment guide
   - Cloud provider options (AWS, GCP, DigitalOcean, Azure, Heroku)
   - Cost estimates
   - Security best practices
   - Monitoring & maintenance
   - Troubleshooting

9. **`DOCKER_QUICK_REFERENCE.md`**
   - Quick command reference
   - Common tasks
   - Troubleshooting tips

10. **`DEPLOYMENT_SUMMARY.md`** (This file)
    - Overview of deployment setup

### Configuration Updates

11. **`apps/web/next.config.js`**
    - Added `output: 'standalone'` for Docker optimization

---

## 🚀 How to Deploy

### Option 1: Development (Local)

```bash
# Start infrastructure only
cd infrastructure/docker
docker compose up -d

# Then run services locally
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- MongoDB: localhost:27017
- Redis: localhost:6379
- Mongo Express: http://localhost:8082
- Redis Commander: http://localhost:8081

---

### Option 2: Production (Docker)

#### Step 1: Create Environment File

Create `.env.production`:

```env
NODE_ENV=production
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_password
REDIS_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
GOOGLE_VISION_API_KEY=your_api_key
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

#### Step 2: Deploy

**Windows:**
```powershell
.\deploy.ps1
# Select option 2 (Production)
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
# Select option 2 (Production)
```

**Manual:**
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

#### Step 3: Verify

```bash
# Check services
docker compose -f docker-compose.prod.yml ps

# Check health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3000

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## 🌐 Cloud Deployment Options

### Recommended for Small Clinics

**DigitalOcean Droplet** or **AWS Lightsail**
- **Cost:** $24-40/month
- **Setup:** 1-2 hours
- **Best for:** < 100 patients/day

**Steps:**
1. Create server (4GB RAM minimum)
2. Install Docker
3. Clone repository
4. Run `./deploy.sh`

---

### Recommended for Medium Clinics

**AWS ECS** or **GCP Cloud Run**
- **Cost:** $50-150/month
- **Setup:** 2-4 hours
- **Best for:** 100-500 patients/day

**Steps:**
1. Push images to container registry
2. Create ECS/Cloud Run services
3. Configure load balancer
4. Set environment variables

---

### Recommended for Large Hospitals

**AWS ECS with Auto-scaling** or **Kubernetes**
- **Cost:** $200-500/month
- **Setup:** 4-8 hours
- **Best for:** 500+ patients/day

---

## 📊 What Each Service Does

### MongoDB (Port 27017)
- Stores all application data
- Patients, bookings, tests, results, etc.
- Persistent volume for data

### Redis (Port 6379)
- Session caching
- Rate limiting
- Temporary data storage

### Patient Service (Port 3001)
- Authentication & authorization
- Patient management
- Test catalog
- Prescription OCR
- Reviews

### Booking Service (Port 3002)
- Booking management
- Sample tracking
- Lab results
- Invoice generation
- Payment processing

### Frontend (Port 3000)
- Next.js web application
- Patient portal
- Admin dashboard
- Public pages

### Nginx (Port 80/443)
- Reverse proxy
- SSL termination
- Load balancing
- Static file serving

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Use strong passwords (32+ characters)
- [ ] Enable SSL/HTTPS
- [ ] Set up firewall rules
- [ ] Configure backup strategy
- [ ] Enable monitoring
- [ ] Set up log rotation
- [ ] Use secrets management
- [ ] Enable 2FA on cloud accounts
- [ ] Restrict database access
- [ ] Use environment-specific API keys
- [ ] Set up automated backups

---

## 📈 Monitoring

### Health Checks

All services have built-in health checks:

```bash
# Check all services
docker compose -f docker-compose.prod.yml ps

# Test endpoints
curl http://localhost:3001/health  # Patient Service
curl http://localhost:3002/health  # Booking Service
curl http://localhost:3000         # Frontend
```

### Resource Monitoring

```bash
# Real-time stats
docker stats

# Disk usage
docker system df

# Logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Or zero-downtime (one service at a time)
docker compose -f docker-compose.prod.yml up -d --no-deps --build frontend
docker compose -f docker-compose.prod.yml up -d --no-deps --build patient-service
docker compose -f docker-compose.prod.yml up -d --no-deps --build booking-service
```

### Backup Database

```bash
# Backup MongoDB
docker exec smartpath-mongodb mongodump \
  -u admin -p your_password \
  --authenticationDatabase admin \
  --out /backups/$(date +%Y%m%d)

# Copy to host
docker cp smartpath-mongodb:/backups ./backups

# Upload to cloud (optional)
aws s3 sync ./backups s3://your-bucket/smartpath-backups/
```

### Restore Database

```bash
# Restore from backup
docker exec smartpath-mongodb mongorestore \
  -u admin -p your_password \
  --authenticationDatabase admin \
  /backups/20260415
```

---

## 💰 Cost Estimates

### Small Deployment (< 100 patients/day)

**DigitalOcean Droplet (4GB RAM):**
- Server: $24/month
- Backups: $5/month
- **Total: ~$30/month**

### Medium Deployment (100-500 patients/day)

**AWS ECS:**
- ECS Tasks: $40/month
- RDS MongoDB: $50/month
- ElastiCache Redis: $15/month
- Load Balancer: $20/month
- **Total: ~$125/month**

### Large Deployment (500+ patients/day)

**AWS ECS with Auto-scaling:**
- ECS Tasks (auto-scaled): $100/month
- RDS MongoDB (Multi-AZ): $150/month
- ElastiCache Redis (Cluster): $50/month
- Load Balancer: $20/month
- CloudWatch: $10/month
- **Total: ~$330/month**

---

## 🐛 Common Issues

### Services Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check specific service
docker logs smartpath-frontend

# Restart
docker compose -f docker-compose.prod.yml restart
```

### Port Already in Use

```bash
# Find process
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.prod.yml
```

### Out of Memory

```bash
# Check usage
docker stats

# Increase Docker memory (Docker Desktop)
# Settings > Resources > Memory

# Add swap (Linux)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 📚 Documentation

- **`DEPLOYMENT_GUIDE.md`** - Complete deployment guide
- **`DOCKER_QUICK_REFERENCE.md`** - Quick command reference
- **`README.md`** - Project overview
- **`QUICK_START_GOOGLE_VISION.md`** - OCR setup

---

## 📞 Support

- **Email:** hello@padc.in
- **Documentation:** See files above
- **Docker Docs:** https://docs.docker.com/

---

## ✅ Next Steps

1. **Review** `DEPLOYMENT_GUIDE.md` for detailed instructions
2. **Choose** deployment option (local, cloud, etc.)
3. **Create** `.env.production` with your credentials
4. **Run** deployment script (`./deploy.sh` or `.\deploy.ps1`)
5. **Verify** all services are healthy
6. **Setup** SSL certificate (for production)
7. **Configure** backups
8. **Enable** monitoring

---

**Deployment Ready! 🚀**

All Docker configuration is complete. Just add your environment variables and deploy!
