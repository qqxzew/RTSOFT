# Google Sign In Integration Setup

## Overview
The frontend now uses Google OAuth for authentication and communicates with the Kotlin backend. The application is a fully-functional Single Page Application (SPA).

## Setup Instructions

### 1. Get Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the consent screen if needed
6. Select **Web application** as the application type
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `http://localhost:8080` (for backend)
8. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:8080`
9. Copy the Client ID

### 2. Configure Environment Variables

#### Frontend (.env)
Update `/frontend/.env` with your Google Client ID:
```env
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id-here
VITE_API_URL=http://localhost:8080
```

#### Backend
Make sure your Kotlin backend has the same Google Client ID set:
```bash
export GOOGLE_CLIENT_ID=your-actual-google-client-id-here
```

### 3. Start the Services

#### Backend (Kotlin)
```bash
cd api
./gradlew run
```
The backend should be running on `http://localhost:8080`

#### Frontend (React)
```bash
cd frontend
npm install  # If you haven't already
npm run dev
```
The frontend should be running on `http://localhost:3000`

## How It Works

### Authentication Flow

1. **User clicks Google Sign In** → Google OAuth popup appears
2. **User authenticates with Google** → Receives ID token
3. **Frontend sends ID token to backend** → `POST /__signin_google__`
4. **Backend verifies token** → Creates/finds user in database
5. **Backend returns JWT token** → Frontend stores it
6. **User is redirected** → To AI onboarding or main app

### Protected Routes

All routes except `/auth` require authentication. The `ProtectedRoute` component:
- Checks if user has a valid JWT token
- Redirects to `/auth` if not authenticated
- Checks if onboarding is complete for protected routes
- Redirects to `/ai-onboarding` if onboarding not complete

### API Communication

The `apiService` (in `src/utils/api.ts`) handles:
- Token storage and management
- Google Sign In API calls
- Protected API requests with Bearer token
- Automatic token cleanup on logout

### SPA Features

- **Client-side routing** with React Router
- **No page reloads** - all navigation is handled by React
- **Persistent state** - Auth tokens stored in localStorage
- **API proxying** - Vite proxies backend requests to avoid CORS

## Backend Endpoints

### Public Endpoints
- `POST /__signin_google__` - Google OAuth login
  - Body: `{ "idToken": "google-id-token" }`
  - Returns: `{ "token": "jwt-token" }`

### Protected Endpoints
- `GET /__prompt__?query=...` - AI prompt endpoint
  - Header: `Authorization: Bearer <jwt-token>`
  - Returns: AI response

## Security Notes

1. **HTTPS in Production**: Use HTTPS for both frontend and backend
2. **Environment Variables**: Never commit actual credentials to git
3. **Token Expiration**: JWT tokens should have expiration times
4. **CORS**: Configure proper CORS settings in production
5. **Google OAuth**: Keep Client ID secret is not required, but Client Secret should never be exposed

## Troubleshooting

### "Invalid Google Token" Error
- Check that GOOGLE_CLIENT_ID matches in both frontend and backend
- Ensure you're using the correct Client ID from Google Cloud Console

### CORS Errors
- Make sure Vite proxy is configured correctly
- Check that backend is running on port 8080

### Token Expired
- User will be automatically logged out
- They can sign in again with Google

### Routes Not Working
- Ensure all routes use `<Link>` or `navigate()` from React Router
- Check that BrowserRouter is properly set up in App.tsx
