# Deployment Guide

## Current Setup

This app is configured to serve both frontend and backend from a single Render service.

## How it works

1. The backend serves the built React app in production
2. API routes are prefixed with `/api/`
3. All other routes serve the React app (client-side routing)

## Deployment Steps

### Option 1: Single Service Deployment (Current Setup)

1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Use the `render.yaml` configuration file
4. Render will:
   - Build the frontend (`npm run build` in frontend folder)
   - Install backend dependencies
   - Start the backend server which serves both API and frontend

### Option 2: Separate Deployments

If you prefer to deploy frontend and backend separately:

#### Frontend (Static Site)

1. Deploy to Netlify, Vercel, or Render Static Site
2. Update `VITE_API_URL` to point to your backend URL
3. Use the `_redirects` file for client-side routing

#### Backend (Node.js Service)

1. Deploy to Render, Railway, or Heroku
2. Remove the static file serving code from `server.js`
3. Update CORS settings to allow your frontend domain

## Environment Variables

Make sure to set these in your Render dashboard:

- `NODE_ENV=production`
- `MONGODB_URI=your_mongodb_connection_string`
- `JWT_SECRET=your_jwt_secret`
- `JWT_REFRESH_SECRET=your_refresh_secret`
- `PORT=10000` (or whatever Render assigns)

## Testing

After deployment, test these URLs:

- `/` - Should show the React app
- `/login` - Should show the login page
- `/dashboard` - Should show dashboard (if authenticated)
- `/api/health` - Should return API health status
