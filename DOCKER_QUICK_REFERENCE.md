# Docker Quick Reference - SmartPath

## 🚀 Quick Commands

### Development

```bash
# Start development infrastructure
cd infrastructure/docker
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f

# Restart service
docker compose restart mongodb
```

### Production

```bash
# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# Stop
docker compose -f docker-compose.prod.yml down

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart specific service
docker compose -f docker-compose.prod.yml restart frontend
```

---

## 📋 Common Tasks

### Check Service Status

```bash
# All services
docker compose -f docker-compose.prod.yml ps

# Specific service
docker ps | grep smartpath-frontend
```

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs

# Specific service
docker compose -f docker-compose.prod.yml logs frontend

# Follow logs
docker compose -f docker-compose.prod.yml logs -f

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Execute Commands in Container

```bash
# MongoDB shell
docker exec -it smartpath-mongodb mongosh -u admin -p your_password

# Redis CLI
docker exec -it smartpath-redis redis-cli -a your_password

# Shell access
docker exec -it smartpath-frontend sh
```

### Backup & Restore

```bash
# Backup MongoDB
docker exec smartpath-mongodb mongodump \
  -u admin -p your_password \
  --authenticationDatabase admin \
  --out /backups/$(date +%Y%m%d)

# Restore MongoDB
docker exec smartpath-mongodb mongorestore \
  -u admin -p your_password \
  --authenticationDatabase admin \
  /backups/20260415
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Zero-downtime update (one service at a time)
docker compose -f docker-compose.prod.yml up -d --no-deps --build frontend
```

### Clean Up

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything
docker system prune -a --volumes
```

---

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs service-name

# Check if port is in use
sudo lsof -i :3000

# Restart service
docker compose -f docker-compose.prod.yml restart service-name
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Increase Docker memory (Docker Desktop)
# Settings > Resources > Memory

# Add swap (Linux)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Database Connection Failed

```bash
# Check MongoDB is running
docker ps | grep mongodb

# Test connection
docker exec smartpath-mongodb mongosh \
  -u admin -p your_password \
  --eval "db.adminCommand('ping')"

# Restart MongoDB
docker compose -f docker-compose.prod.yml restart mongodb
```

---

## 📊 Monitoring

### Resource Usage

```bash
# Real-time stats
docker stats

# Disk usage
docker system df

# Container details
docker inspect smartpath-frontend
```

### Health Checks

```bash
# Check health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Test endpoints
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3000
```

---

## 🔒 Security

### Update Images

```bash
# Pull latest base images
docker compose -f docker-compose.prod.yml pull

# Rebuild with latest
docker compose -f docker-compose.prod.yml up -d --build
```

### Scan for Vulnerabilities

```bash
# Scan image
docker scan smartpath-frontend

# Or use Trivy
trivy image smartpath-frontend
```

---

## 📁 File Locations

### Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect smartpath_mongodb_data

# Backup volume
docker run --rm -v smartpath_mongodb_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mongodb-backup.tar.gz /data
```

### Logs

```bash
# Container logs location
/var/lib/docker/containers/<container-id>/<container-id>-json.log

# View with less
docker logs smartpath-frontend 2>&1 | less
```

---

## 🚀 Deployment Scripts

### Windows (PowerShell)

```powershell
# Run deployment script
.\deploy.ps1

# Or manual
docker compose -f docker-compose.prod.yml up -d --build
```

### Linux/Mac (Bash)

```bash
# Run deployment script
chmod +x deploy.sh
./deploy.sh

# Or manual
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 📞 Support

- **Full Guide**: `DEPLOYMENT_GUIDE.md`
- **Email**: hello@padc.in
- **Docker Docs**: https://docs.docker.com/

---

**Quick Reference v1.0**
