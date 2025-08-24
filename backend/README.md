# Runner Match - Backend API

This is the backend API for the Runner Match application, built with Next.js 14 and Prisma.

## 🛠️ Tech Stack

- **Next.js 14** with App Router
- **Prisma ORM** with SQLite database
- **TypeScript** for type safety

## 📁 Structure

```
backend/
├── app/api/               # API routes
│   ├── auth/             # Authentication endpoints
│   ├── discover/         # Discovery endpoints
│   ├── matches/          # Match management endpoints
│   ├── profile/          # Profile management endpoints
│   └── runs/             # Run management endpoints
├── lib/                  # Utility functions
│   ├── match.ts         # Matching algorithm
│   └── prisma.ts        # Prisma client
└── prisma/              # Database schema and seeds
    ├── schema.prisma    # Database schema
    └── seed.ts          # Sample data
```

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📊 API Endpoints

### Authentication
- `GET /api/auth/user` - Get current authenticated user

### Profile Management
- `GET /api/profile` - Get user profile and preferences
- `POST /api/profile` - Create/update user profile

### Discovery
- `GET /api/discover` - Get potential running partners

### Matches
- `GET /api/matches` - Get user's matches
- `POST /api/matches` - Send a match request
- `PATCH /api/matches/:id` - Update match status (accept/decline)

### Runs
- `GET /api/runs` - Get nearby runs
- `POST /api/runs` - Create a new run

## 🗄️ Database

The app uses Prisma with SQLite for local development. The main entities are:

- **User**: Basic user information
- **Preference**: Running preferences and settings
- **Match**: Match requests between users
- **Run**: Running sessions
- **RunParticipant**: Users participating in runs

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx prisma db push` - Apply schema changes
- `npx prisma db seed` - Seed database
- `npx prisma studio` - Open database GUI
