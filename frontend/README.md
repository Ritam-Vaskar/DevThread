# DevThreads Frontend

React/Next.js frontend for DevThreads platform.

## Features

- Next.js 14 with App Router
- Apollo Client for GraphQL
- Tailwind CSS for styling
- Real-time subscriptions
- Responsive design
- Dark mode

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:8080/graphql
```

## Project Structure

```
frontend/
├── app/                 # Next.js pages
│   ├── page.jsx        # Login
│   ├── signup/         # Registration
│   ├── feed/           # Main feed
│   ├── profile/        # User profile
│   └── admin/          # Admin portal
├── components/         # Reusable components
│   ├── PostCard.jsx
│   ├── ReelCard.jsx
│   ├── Sidebar.jsx
│   ├── TagBar.jsx
│   └── PostModal.jsx
├── lib/                # Utilities
│   ├── apollo-client.js
│   ├── queries.js
│   ├── mutations.js
│   ├── subscriptions.js
│   └── utils.js
└── public/             # Static assets
```

## Components

### PostCard
Displays a DevTweet with engagement buttons.

### ReelCard
Displays a DevReel with video preview.

### Sidebar
Main navigation sidebar.

### PostModal
Modal for creating posts and reels.

## GraphQL Integration

Apollo Client is configured with:
- HTTP Link for queries/mutations
- WebSocket Link for subscriptions
- Authentication via JWT tokens
- Caching with InMemoryCache

## Styling

Tailwind CSS with custom theme:
- Dark mode optimized
- Cyan/Blue primary colors
- Custom components in `globals.css`
- Responsive breakpoints

## Authentication

JWT tokens stored in localStorage:
- `accessToken`: Short-lived (15min)
- `refreshToken`: Long-lived (7d)
- `user`: User data cache

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```bash
docker build -t devthreads-frontend .
docker run -p 3000:3000 devthreads-frontend
```

## License

MIT
