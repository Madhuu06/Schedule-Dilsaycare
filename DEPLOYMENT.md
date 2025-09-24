# Scheduler App Deployment Guide

## Backend Deployment (Render)

### 1. Prepare for Production
Update `package.json` to include production build command:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "postbuild": "npm run migrate"
  }
}
```

### 2. Environment Variables on Render
Set these environment variables in Render dashboard:
```
NODE_ENV=production
DATABASE_URL=postgresql://[your-render-postgres-url]
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
PORT=10000
```

### 3. Build Command
```bash
npm install && npm run build
```

### 4. Start Command
```bash
npm start
```

## Frontend Deployment (Vercel)

### 1. Environment Variables on Vercel
Set in Vercel dashboard:
```
REACT_APP_API_URL=https://your-backend-domain.onrender.com/api
```

### 2. Build Settings
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

## Database Setup (Render PostgreSQL)

1. Create PostgreSQL database on Render
2. Copy the connection string
3. Update backend environment variables
4. Migrations will run automatically on deployment

## Post-Deployment Checklist

- [ ] Backend API health check: `GET /health`
- [ ] Database connection working
- [ ] Frontend loading properly
- [ ] CORS configured correctly
- [ ] All API endpoints working
- [ ] Slot creation/editing working
- [ ] Infinite scroll working