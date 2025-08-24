# Runner Match - Frontend

This is the frontend application for the Runner Match app, built with React and Vite.

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TanStack Query** for data fetching and caching
- **Wouter** for client-side routing
- **shadcn/ui** component library
- **TailwindCSS** for styling
- **FontAwesome** for icons

## 📁 Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── MatchCard.tsx # Match card component
│   │   ├── PaceRangeSlider.tsx
│   │   └── ScheduleSelector.tsx
│   ├── pages/            # Application pages
│   │   ├── Discover.tsx  # Discovery page
│   │   ├── Home.tsx      # Main app page
│   │   ├── Landing.tsx   # Landing page
│   │   ├── Matches.tsx   # Matches page
│   │   └── Profile.tsx   # Profile page
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts    # Authentication hook
│   │   └── use-toast.ts  # Toast notifications
│   ├── lib/              # Utility functions
│   │   ├── authUtils.ts  # Auth utilities
│   │   ├── queryClient.ts # React Query client
│   │   └── utils.ts      # General utilities
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
├── index.html            # HTML template
└── vite.config.ts        # Vite configuration
```

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 🎨 Features

### Pages
- **Landing**: Welcome page with app introduction
- **Home**: Main dashboard with tabbed navigation
- **Profile**: User profile and preferences management
- **Discover**: Browse potential running partners
- **Matches**: Manage match requests and connections

### Components
- **MatchCard**: Displays runner profile information
- **PaceRangeSlider**: Interactive pace selection
- **ScheduleSelector**: Weekly schedule picker
- **UI Components**: Complete set of shadcn/ui components

## 🔧 Configuration

### API Proxy
The Vite development server is configured to proxy API requests to the backend:
```typescript
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3000",
      changeOrigin: true,
    },
  },
}
```

### Path Aliases
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "src"),
  },
}
```

## 🎯 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check with TypeScript

## 🎨 Styling

- Uses **TailwindCSS** for utility-first styling
- **shadcn/ui** components for consistent design
- **FontAwesome** icons for UI elements
- Responsive design that works on mobile and desktop
