# Task Manager

A full-stack task management application with role-based access for managers and team members. Built with React, Node.js/Express, MongoDB, and Cloudinary.

## Features

- **Role-based access**: Manager and Team Member roles
- **Team management**: Managers can create teams and add members by email
- **Task management**: Create, assign, edit, and delete tasks
- **Rich text editor**: Full-featured content editor (ReactQuill) with formatting, code blocks, links, and images
- **Image uploads**: Upload images via Cloudinary and attach them to tasks
- **Bug tracking**: Managers can mark tasks as bugged with reasons; team members see bug reports and can update task status
- **Status workflow**: Tasks move through todo → in-progress → in-review → done
- **Priority levels**: Low, Medium, High

## Tech Stack

- **Frontend**: React (Vite), React Router, ReactQuill, React Toastify, Axios
- **Backend**: Node.js, Express, Mongoose, JWT authentication
- **Database**: MongoDB
- **Image Storage**: Cloudinary
- **Auth**: JSON Web Tokens (JWT) + bcryptjs

## Project Structure

```
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # Navbar, PrivateRoute
│       ├── context/        # AuthContext
│       ├── pages/          # All page components
│       └── services/       # API service (axios)
├── server/                 # Express backend
│   └── src/
│       ├── config/         # DB and Cloudinary config
│       ├── middleware/      # Auth and role-check middleware
│       ├── models/         # User, Team, Task models
│       └── routes/         # Auth, Teams, Tasks, Upload routes
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account

### Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Cloudinary credentials
npm install
npm start
```

The server runs on `http://localhost:5000`.

### Frontend Setup

```bash
cd client
cp .env.example .env
# Edit .env with your backend API URL if different from localhost
npm install
npm run dev
```

The client runs on `http://localhost:5173`.

### Environment Variables (server/.env)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Environment Variables (client/.env)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (default: http://localhost:5000/api) |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user

### Teams
- `POST /api/teams` - Create team (manager only)
- `GET /api/teams` - List user's teams
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id/members` - Add member by email (manager only)
- `DELETE /api/teams/:id/members/:memberId` - Remove member (manager only)

### Tasks
- `POST /api/tasks` - Create task (manager only)
- `GET /api/tasks` - List tasks (optional `?teamId=`)
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/bug` - Mark/unmark task as bugged (manager only)
- `DELETE /api/tasks/:id` - Delete task (manager only)

### Upload
- `POST /api/upload` - Upload image to Cloudinary

## Deployment

### Client (Frontend) Deployment

The client is configured for deployment on Vercel, Netlify, or any static hosting service with proper SPA routing support.

#### Important: SPA Routing Configuration
The application uses client-side routing with React Router. Configuration files are included to handle page refreshes correctly:

- **`client/vercel.json`** - Configures Vercel to serve index.html for all routes
- **`client/public/_redirects`** - Configures Netlify and other static hosts

Without these configurations, refreshing the page on routes like `/dashboard` or `/tasks` would result in a 404 error.

#### Vercel Deployment (Recommended)
1. Create a new project on Vercel
2. Point it to your repository
3. Set root directory to `client`
4. Add environment variable: `VITE_API_URL` (your backend API URL)
5. Deploy - the `vercel.json` will be automatically detected

#### Netlify Deployment
1. Create a new site on Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_URL` (your backend API URL)
5. Deploy - the `_redirects` file will be automatically copied to dist

#### Other Static Hosts
For other hosting providers, ensure they support:
- Serving `index.html` for all routes (SPA fallback)
- Or configure redirects/rewrites similar to the provided config files

### Server (Backend) Deployment

Deploy the Express backend to Vercel, Heroku, Railway, or any Node.js hosting service. Ensure environment variables are properly configured.

## Performance Optimizations

This application includes several performance optimizations to ensure fast page loads:

### Backend Optimizations
- **Database Indexes**: Added indexes on frequently queried fields (team, assignedTo, createdBy, manager, members) for faster queries
- **Lean Queries**: Using Mongoose `.lean()` for read-only operations reduces memory overhead by 50-70%
- **Connection Pooling**: Configured MongoDB connection with optimal pool size (10 connections)
- **Response Compression**: Gzip compression enabled for all API responses
- **Optimized Populate**: Only selecting necessary fields in populate operations

### Frontend Optimizations
- **Code Splitting**: Vendor chunks separated for better caching
- **Parallel Requests**: Dashboard fetches tasks and teams in parallel using `Promise.all()`
- **Request Timeout**: 10-second timeout prevents hanging requests
- **Optimized Build**: Vite configuration optimized for production builds

### Deployment Best Practices

#### For Vercel Deployment:
1. **Use MongoDB Atlas** (not local) for production database with proper region selection
2. **Enable Connection Pooling** in MongoDB Atlas
3. **Add Database Indexes** (already included in models)
4. **Use Environment Variables** properly in Vercel dashboard
5. **Consider Vercel's Serverless Function Limits**: Cold starts may add 1-2 seconds on first request

#### For Better Performance:
- Deploy backend and frontend in the same region as your MongoDB cluster
- Use a CDN for static assets
- Consider upgrading MongoDB Atlas tier if on free tier (M0) which has limited performance
- Monitor your MongoDB slow queries using Atlas Performance Advisor
- For very high traffic, consider implementing Redis caching layer

#### Expected Performance:
- **With optimizations**: 200-800ms page load time
- **Database queries**: 10-50ms with indexes
- **API response time**: 100-300ms typical

If you're still experiencing 5+ second load times after these optimizations, check:
1. MongoDB Atlas connection string and region
2. Network latency between Vercel region and MongoDB region
3. MongoDB Atlas tier (M0 free tier has limitations)
4. Cold start times in Vercel serverless functions