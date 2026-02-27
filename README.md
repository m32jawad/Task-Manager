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