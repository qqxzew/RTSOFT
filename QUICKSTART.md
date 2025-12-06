# Quick Start Guide

## Setup (First Time Only)

1. **Get Google OAuth Client ID**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 Client ID
   - Add authorized origins: `http://localhost:3000` and `http://localhost:8080`

2. **Configure Environment**
   ```bash
   # Create .env in root directory
   cp .env.example .env
   
   # Edit .env and add:
   GOOGLE_CLIENT_ID=your-google-client-id-here
   OPENAI_API_KEY=your-openai-key-here
   ```

3. **Update Frontend .env**
   ```bash
   # Edit frontend/.env
   VITE_GOOGLE_CLIENT_ID=same-google-client-id-here
   ```

## Run Locally (Development)

```bash
# Terminal 1 - Backend
cd api
export GOOGLE_CLIENT_ID=your-client-id
./gradlew run

# Terminal 2 - Frontend  
cd frontend
npm install  # First time only
npm run dev

# Visit http://localhost:3000
```

## Run with Docker

```bash
# Make sure .env is configured
docker-compose up --build

# Visit http://localhost:3000
```

## Key URLs

- **Frontend**: http://localhost:3000 (main access point)
- **Backend API**: http://localhost:8080 (API endpoints)
- **AI Service**: http://localhost:5001 (internal)

## How It Works

1. **Frontend (Port 3000)**: React SPA handles all UI and routing
2. **Backend (Port 8080)**: Kotlin API handles authentication and data
3. **Communication**: Frontend → Vite Proxy → Backend API
4. **SPA Routing**: All navigation happens client-side (no page reloads!)

## Important Notes

✅ Both frontend and backend use the **SAME** Google Client ID  
✅ Frontend runs on port **3000** (not 5173 or 5174)  
✅ Access app via **http://localhost:3000** for best experience  
✅ Backend API routes are prefixed with `__` (e.g., `/__signin_google__`)  
✅ All frontend routes handled by React Router (SPA)

## Test the Flow

1. Go to http://localhost:3000/auth
2. Click "Sign in with Google"
3. Login with your Google account
4. Should redirect to /ai-onboarding
5. Navigate around - notice no page reloads!

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

**Google Sign In not working:**
- Check Client ID matches in both .env files
- Verify authorized origins in Google Cloud Console
- Clear browser cache

**API calls failing:**
- Ensure backend is running on port 8080
- Check Vite proxy config in vite.config.ts
- Look for CORS errors in browser console

For detailed information, see:
- `DEPLOYMENT.md` - Full architecture and routing
- `GOOGLE_AUTH_SETUP.md` - Google OAuth setup
- `IMPLEMENTATION_COMPLETE.md` - Implementation details
