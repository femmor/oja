# Oja E-commerce Platform

A full-stack e-commerce platform built with Bun, React (Admin Dashboard), Express.js (Backend), and React Native (Mobile App).

## 📁 Project Structure

```
oja/
├── admin/          # React-based admin dashboard
├── backend/        # Express.js API server
├── mobile/         # React Native mobile application
├── Dockerfile      # Production container configuration
├── docker-compose.yml  # Local development orchestration
└── package.json    # Workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js 20.19+ or 22.12+ (for Vite)
- Docker (for containerized deployment)

### Local Development

```bash
# Install all dependencies
bun install:all

# Start development servers
bun run dev:admin    # Admin dashboard (Vite dev server)
bun run dev:backend  # Backend API (with file watching)
bun run dev:mobile   # Mobile app (Expo)

# Or run all together
bun run dev
```

### Local Production Testing

```bash
# Build all components
bun run build

# Start production server
bun start
# or
NODE_ENV=production bun start
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended for local testing)

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f oja-app

# Stop services
docker-compose down
```

### Using Docker directly

```bash
# Build the image
docker build -t oja-ecommerce .

# Run the container
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  oja-ecommerce

# Run with additional environment variables
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e DB_URL=your_database_url \
  oja-ecommerce
```

## ☁️ Cloud Deployment Strategies

### Option 1: Container-Based Platforms

#### Google Cloud Run

```bash
# Deploy from source
gcloud run deploy oja-ecommerce \
  --source . \
  --port 8080 \
  --set-env-vars NODE_ENV=production

# Or build and deploy from container registry
docker build -t gcr.io/PROJECT_ID/oja-ecommerce .
docker push gcr.io/PROJECT_ID/oja-ecommerce
gcloud run deploy --image gcr.io/PROJECT_ID/oja-ecommerce --port 8080
```

#### AWS ECS/Fargate

1. Build and push to ECR

```bash
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com
docker build -t oja-ecommerce .
docker tag oja-ecommerce:latest ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/oja-ecommerce:latest
docker push ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/oja-ecommerce:latest
```

2. Create ECS task definition with the image
3. Deploy to ECS service

#### Azure Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name oja-ecommerce \
  --image oja-ecommerce \
  --dns-name-label oja-ecommerce-demo \
  --ports 8080 \
  --environment-variables NODE_ENV=production PORT=8080
```

### Option 2: Platform-as-a-Service

#### Heroku

```bash
# Using Container Registry
heroku container:push web -a your-app-name
heroku container:release web -a your-app-name

# Or using buildpacks (create heroku.yml)
git push heroku main
```

#### Railway

```bash
# Connect GitHub repository and deploy
railway login
railway link
railway up
```

#### Render

1. Connect your GitHub repository
2. Set build command: `bun install:all && bun run build`
3. Set start command: `bun start`
4. Set environment variable: `NODE_ENV=production`

#### DigitalOcean App Platform

```yaml
# .do/app.yaml
name: oja-ecommerce
services:
  - name: web
    source_dir: /
    github:
      repo: your-username/oja
      branch: main
    build_command: bun install:all && bun run build
    run_command: bun start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 8080
    env:
      - key: NODE_ENV
        value: production
```

### Option 3: Serverless (Admin Only)

For serving only the admin dashboard as a static site:

#### Vercel

```bash
cd admin
vercel --prod
```

#### Netlify

```bash
cd admin
npm run build
# Deploy dist/ folder to Netlify
```

## 🔧 Environment Variables

### Required for Production

```env
NODE_ENV=production
PORT=8080
```

### Optional (based on your features)

```env
# Database
DB_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://host:port

# Authentication
JWT_SECRET=your-secret-key
BCRYPT_ROUNDS=12

# External Services
STRIPE_SECRET_KEY=sk_...
SENDGRID_API_KEY=SG....
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...

# Monitoring
SENTRY_DSN=https://...
```

## 🏗️ Build Process

The deployment follows this process:

1. **Install Dependencies**: `bun install:all`
2. **Build Admin Dashboard**: `bun run build:admin`
   - Compiles React app with Vite
   - Outputs to `admin/dist/`
3. **Build Backend**: `bun run build:backend`
   - Compiles TypeScript to optimized bundle
   - Outputs to `backend/dist/`
4. **Start Production Server**: `bun start`
   - Serves admin dashboard as static files
   - Provides API endpoints
   - Handles SPA routing

## 📊 Health Monitoring

The application includes a health check endpoint:

```bash
# Check application health
curl http://localhost:8080/api/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2025-12-16T10:30:00.000Z"
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**: Check Node.js version (requires 20.19+ or 22.12+)
2. **Port Conflicts**: Ensure port 8080 is available or change PORT env var
3. **Memory Issues**: Increase container memory limits for large builds
4. **Static Files Not Served**: Verify `admin/dist/` exists after build

### Debugging Commands

```bash
# Check build output
ls -la admin/dist/
ls -la backend/dist/

# Test production build locally
NODE_ENV=production PORT=3000 bun start

# Check logs in Docker
docker-compose logs -f oja-app

# Get container shell access
docker-compose exec oja-app bash
```

## 📱 Mobile App Deployment

The mobile app (`/mobile`) is built with React Native and requires separate deployment:

- **iOS**: Deploy to App Store via Xcode or EAS Build
- **Android**: Deploy to Google Play Store via Android Studio or EAS Build
- **Web**: Can be deployed as a separate web app

See `mobile/README.md` for mobile-specific deployment instructions.

## 🚨 Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Configure database connection
- [ ] Set up monitoring and logging
- [ ] Configure SSL certificates
- [ ] Set up database backups
- [ ] Configure CDN for static assets (optional)
- [ ] Test health endpoints
- [ ] Set up CI/CD pipeline
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `docker-compose up --build`
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details.
