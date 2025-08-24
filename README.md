# Runner Match App

A web application for matching runners based on pace, location, and schedule preferences.

## 🏃‍♂️ Features

- **Profile Management**: Set your running preferences, pace, location, and schedule
- **Smart Matching**: Find running partners based on compatibility scores
- **Discovery**: Browse potential running partners in your area
- **Match Management**: Send, accept, or decline match requests
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Next.js 14** with App Router
- **Prisma ORM** with SQLite database
- **TypeScript** for type safety
- **TailwindCSS** for styling

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TanStack Query** for data fetching
- **Wouter** for routing
- **shadcn/ui** component library
- **TailwindCSS** for styling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <https://github.com/Yashasrn33/RunSync>
   cd runner-match-app
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start:
- Backend API server on `http://localhost:3000`
- Frontend development server on `http://localhost:5173`

## 📁 Project Structure

```
runner-match-app/
├── backend/                 # Next.js API backend
│   ├── app/api/            # API routes
│   ├── lib/                # Utility functions
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   └── package.json
└── package.json           # Root package.json for monorepo
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run install:all` - Install dependencies for all packages

### Backend Scripts
- `npm run dev:backend` - Start backend development server
- `npm run db:push` - Apply database schema changes
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio database GUI

### Frontend Scripts
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production

## 🗄️ Database Schema

The app uses the following main entities:
- **User**: Basic user information
- **Preference**: Running preferences (pace, location, schedule, goals)
- **Match**: Match requests between users
- **Run**: Individual running sessions
- **RunParticipant**: Users participating in runs

## 🏃‍♀️ Usage

1. **Visit the landing page** at `http://localhost:5173`
2. **Click "Get Started"** to begin using the app
3. **Set up your profile** with running preferences
4. **Discover runners** in your area with compatible preferences
5. **Send match requests** to potential running partners
6. **Manage matches** and plan running sessions

## 🔒 Authentication

Currently uses a simplified authentication system for development. In production, this should be replaced with a proper authentication provider (NextAuth.js, Auth0, etc.).

## 🚧 Development Notes

- The app uses miles for distance and min/mile for pace
- API endpoints are proxied from frontend to backend during development
- Database uses SQLite for local development (can be migrated to PostgreSQL for production)

## 📝 License

MIT License - see LICENSE file for details
