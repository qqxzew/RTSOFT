# Deployment Guide

## Architecture Overview

The application consists of three services:

1. **Frontend (React + Vite)** - Port 3000 (mapped to 3000 on host)
2. **Backend (Kotlin)** - Port 8080 (mapped to 8080 on host)
3. **AI Service (Flask)** - Port 5000 (mapped to 5001 on host)

## Port Configuration

### Local Development (without Docker)

- **Frontend**: `http://localhost:3000` (Vite dev server)
- **Backend**: `http://localhost:8080` (Kotlin server)
- **AI Service**: `http://localhost:5000` (Flask server)

### Docker Development

- **Frontend**: `http://localhost:3000` (container: react:3000)
- **Backend**: `http://localhost:8080` (container: kotlin:8080)
- **AI Service**: `http://localhost:5001` (container: flask:5000)

## Routing Strategy

### Frontend Routes (handled by React Router SPA)
All client-side routes are handled by the React application:
- `/auth` - Authentication page
- `/ai-onboarding` - AI onboarding flow
- `/` - Home/Landing
- `/prehled` - Overview
- `/roadmap` - Roadmap page
- etc.

### Backend API Routes (handled by Kotlin)
API endpoints are prefixed to avoid conflicts:
- `/__signin_google__` - Google OAuth authentication
- `/__prompt__` - AI prompt (protected)
- `/chat` - Chat resources
- `/chat3d` - 3D chat resources
- `/brunette.glb` - 3D model assets

### How It Works

1. **Direct Frontend Access**: Users go to `http://localhost:3000` → React SPA handles routing
2. **Via Backend**: Users go to `http://localhost:8080` → Backend proxies `/` to React container
3. **API Calls**: Frontend makes API calls to `/__signin_google__`, etc. → Vite proxy forwards to backend

## Setup Instructions

### 1. Configure Environment Variables

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
GOOGLE_CLIENT_ID=your-actual-google-client-id
OPENAI_API_KEY=your-actual-openai-key
```

### 2. Local Development (Recommended)

**Terminal 1 - Backend:**
```bash
cd api
export GOOGLE_CLIENT_ID=your-client-id
./gradlew run
```

**Terminal 2 - AI Service:**
```bash
cd ai
export OPENAI_API_KEY=your-openai-key
python3 base.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Then visit: `http://localhost:3000`

### 3. Docker Development

Build and start all services:

```bash
docker-compose up --build
```

Access the application:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- AI Service: `http://localhost:5001`

Stop services:

```bash
docker-compose down
```

## How the SPA Works

### Client-Side Navigation
When navigating between routes in the React app (e.g., from `/auth` to `/ai-onboarding`):
1. React Router intercepts the navigation
2. No page reload occurs
3. React renders the new component
4. URL updates via browser History API

### API Communication
When making API calls:
1. Frontend calls `/__signin_google__` or `/__prompt__`
2. **Local Dev**: Vite proxy forwards to `http://localhost:8080`
3. **Docker**: Vite proxy forwards to `http://kotlin:8080` (via Docker network)
4. Backend processes the request
5. Response returns to frontend

### Backend Proxy (Fallback)
If someone accesses `http://localhost:8080/`:
1. Kotlin backend receives the request
2. Backend proxies to React dev server (`http://react:3000` in Docker)
3. React serves the SPA
4. User can navigate normally

This allows both entry points to work!

## Production Considerations

For production deployment:

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```
   This creates optimized static files in `frontend/dist`

2. **Serve Static Files**:
   - Option A: Use a CDN/Static hosting (Vercel, Netlify)
   - Option B: Serve from Kotlin backend with static file routes
   - Option C: Use Nginx reverse proxy

3. **Environment Variables**:
   - Set `VITE_API_URL` to your production backend URL
   - Set `VITE_GOOGLE_CLIENT_ID` to your production OAuth client
   - Use HTTPS for all services

4. **CORS Configuration**:
   - Configure proper CORS headers in Kotlin backend
   - Whitelist your frontend domain

5. **Security**:
   - Enable HTTPS
   - Set secure cookie flags
   - Configure CSP headers
   - Rotate secrets regularly

## Troubleshooting

**Frontend can't reach backend:**
- Check that backend is running on port 8080
- Verify Vite proxy configuration in `vite.config.ts`
- Check CORS settings

**Docker containers can't communicate:**
- Ensure all services are in the same Docker network
- Use service names (react, kotlin, flask) not localhost
- Check docker-compose.yml depends_on configuration

**Routes return 404:**
- For frontend routes: Ensure React Router is configured
- For backend routes: Check route definitions in Main.kt
- Clear browser cache and hard reload

**Hot reload not working in Docker:**
- Verify volumes are mounted correctly in docker-compose.yml
- Check CHOKIDAR_USEPOLLING is set for React container
