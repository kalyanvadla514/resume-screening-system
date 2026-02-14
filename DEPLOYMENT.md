# Deployment Guide

This guide covers deploying the Resume Screening System to production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [ML Service Deployment](#ml-service-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment](#post-deployment)

## Prerequisites

- Server with Node.js 18+ and Python 3.8+
- MongoDB database (MongoDB Atlas recommended)
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier available)
3. Configure network access (add your server IP)
4. Create database user
5. Get connection string

```
mongodb+srv://username:password@cluster.mongodb.net/resume-screening
```

### Option 2: Self-Hosted MongoDB

```bash
# Install MongoDB
sudo apt-get install mongodb

# Start service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Configure for remote access
sudo nano /etc/mongodb.conf
# Change bindIp to 0.0.0.0

# Restart
sudo systemctl restart mongodb
```

## Backend Deployment

### Option 1: Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
cd backend
heroku create resume-screening-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret-key
heroku config:set FRONTEND_URL=https://your-frontend-url.com
heroku config:set ML_SERVICE_URL=https://your-ml-service-url.com

# Deploy
git push heroku main

# Scale
heroku ps:scale web=1
```

### Option 2: AWS EC2

```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo-url>
cd resume-screening-system/backend

# Install dependencies
npm install --production

# Install PM2 for process management
sudo npm install -g pm2

# Create .env file
nano .env
# Add your production environment variables

# Start with PM2
pm2 start server.js --name resume-api
pm2 save
pm2 startup

# Setup Nginx as reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/resume-api

# Add configuration:
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/resume-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Option 3: DigitalOcean App Platform

1. Create DigitalOcean account
2. Go to App Platform
3. Connect GitHub repository
4. Select `backend` directory
5. Configure:
   - Build Command: `npm install`
   - Run Command: `npm start`
6. Add environment variables
7. Deploy

## ML Service Deployment

### Option 1: AWS Lambda (Recommended for Cost)

```bash
# Install Serverless Framework
npm install -g serverless

# Create serverless.yml
cd ml-service
```

```yaml
service: resume-ml-service

provider:
  name: aws
  runtime: python3.8
  region: us-east-1

functions:
  parseResume:
    handler: handler.parse_resume
    events:
      - http:
          path: api/parse-resume
          method: post
  match:
    handler: handler.match
    events:
      - http:
          path: api/match
          method: post
```

```bash
# Deploy
serverless deploy
```

### Option 2: Google Cloud Run

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash

# Login
gcloud auth login

# Create Dockerfile
cd ml-service
nano Dockerfile
```

```dockerfile
FROM python:3.8-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/ml-service
gcloud run deploy ml-service --image gcr.io/PROJECT-ID/ml-service --platform managed
```

### Option 3: Railway.app

1. Connect GitHub repository
2. Select `ml-service` directory
3. Railway auto-detects Python
4. Deploy automatically

## Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Production deployment
vercel --prod

# Or connect GitHub repository in Vercel dashboard
```

Configure environment variables in Vercel dashboard:
- `VITE_API_URL`: Your backend URL
- `VITE_ML_SERVICE_URL`: Your ML service URL

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

Or use Netlify dashboard:
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`

### Option 3: AWS S3 + CloudFront

```bash
# Build
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR-DIST-ID --paths "/*"
```

## Docker Deployment

### Complete Docker Setup

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: resume-mongodb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123

  backend:
    build: ./backend
    container_name: resume-backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password123@mongodb:27017/resume-screening?authSource=admin
      - JWT_SECRET=your-production-secret
      - FRONTEND_URL=https://your-domain.com
      - ML_SERVICE_URL=http://ml-service:8000
    depends_on:
      - mongodb
    volumes:
      - ./backend/uploads:/app/uploads

  ml-service:
    build: ./ml-service
    container_name: resume-ml-service
    restart: always
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    container_name: resume-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Create `ml-service/Dockerfile`:

```dockerfile
FROM python:3.8-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Deploy:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild specific service
docker-compose up -d --build backend
```

## Environment Configuration

### Production Environment Variables

**Backend (.env.production)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resume-screening
JWT_SECRET=super-secret-change-this-in-production-min-32-chars
JWT_EXPIRE=7d
FRONTEND_URL=https://resume.yourdomain.com
ML_SERVICE_URL=https://ml.yourdomain.com
MAX_FILE_SIZE=5242880
```

**Frontend (.env.production)**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_ML_SERVICE_URL=https://ml.yourdomain.com
```

## Post-Deployment

### 1. Health Checks

```bash
# Backend
curl https://api.yourdomain.com/api/health

# ML Service
curl https://ml.yourdomain.com/health

# Frontend
curl https://yourdomain.com
```

### 2. Create Admin User

```bash
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@company.com",
    "password": "SecurePassword123",
    "role": "admin"
  }'
```

### 3. Monitor Logs

```bash
# PM2 logs
pm2 logs resume-api

# Docker logs
docker-compose logs -f

# Heroku logs
heroku logs --tail
```

### 4. Setup Monitoring

**Use monitoring services:**
- **New Relic**: Application performance monitoring
- **Sentry**: Error tracking
- **Datadog**: Infrastructure monitoring
- **Uptime Robot**: Uptime monitoring

### 5. Backup Strategy

```bash
# MongoDB backup
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# Automated backups with cron
0 2 * * * /path/to/backup-script.sh
```

### 6. Performance Optimization

- Enable gzip compression in Nginx
- Configure CDN (CloudFlare recommended)
- Implement Redis caching
- Enable database indexes
- Configure proper CORS headers
- Minify and bundle frontend assets

## Troubleshooting

### Common Issues

**CORS Errors**
```nginx
# Add to Nginx config
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE';
```

**Database Connection Issues**
- Check MongoDB connection string
- Verify network access in MongoDB Atlas
- Ensure firewall allows connection

**High Memory Usage**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 server.js
```

**SSL Certificate Issues**
```bash
# Renew Let's Encrypt certificate
sudo certbot renew
```

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set strong JWT secret (min 32 characters)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Implement logging and monitoring
- [ ] Regular database backups
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection prevention
- [ ] XSS protection

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ELB, Nginx)
- Deploy multiple backend instances
- Session management with Redis
- Shared file storage (AWS S3)

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching
- Use CDN for static assets

---

For support, contact the development team or create an issue in the repository.
