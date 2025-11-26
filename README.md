# DevThreads v1

A fully-functional developer community platform featuring microblogs (DevTweets) and short coding videos (DevReels) with gamification, real-time updates, and a comprehensive admin portal.

## 🚀 Features

### Core Features
- **Authentication**: JWT-based auth with Access + Refresh tokens, GitHub OAuth integration
- **DevTweets**: Short posts (280 chars) with code snippets and syntax highlighting
- **DevReels**: Short video posts (≤60s) with Cloudinary integration
- **Engagement**: Likes, upvotes, comments, views with real-time updates
- **Gamification**: Reputation points, level system, and achievement badges
- **Real-time**: GraphQL subscriptions for live comments and likes
- **Admin Portal**: Full CRUD, analytics dashboard, user management, moderation logs

### Tech Stack

**Backend**
- Go 1.21+ with gqlgen (GraphQL)
- MongoDB for data storage
- JWT authentication
- Cloudinary for media uploads
- GraphQL subscriptions (WebSocket)

**Frontend**
- React 18 with Next.js 14
- Apollo Client for GraphQL
- Tailwind CSS for styling
- Real-time subscriptions

## 📦 Project Structure

```
DevThreads-v2/
├── backend/
│   ├── cmd/server/          # Application entry point
│   ├── config/              # Configuration
│   ├── graph/               # GraphQL schema & resolvers
│   ├── internal/            # Core business logic
│   │   ├── auth/            # Authentication
│   │   ├── database/        # MongoDB connection
│   │   ├── middleware/      # HTTP middleware
│   │   ├── models/          # Data models
│   │   └── repository/      # Data access layer
│   ├── docker-compose.yml   # Docker services
│   └── README.md            # Backend documentation
│
└── frontend/
    ├── app/                 # Next.js pages
    │   ├── page.jsx         # Login page
    │   ├── signup/          # Signup page
    │   ├── feed/            # Main feed
    │   ├── profile/         # User profile
    │   └── admin/           # Admin portal
    ├── components/          # React components
    ├── lib/                 # GraphQL queries & utilities
    └── README.md            # Frontend documentation
```

## 🛠️ Quick Start

### Prerequisites

- **Go**: 1.21 or higher
- **Node.js**: 18+ and npm/pnpm
- **MongoDB**: 5.0+
- **Cloudinary Account**: For media uploads (optional for development)

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install Go dependencies**:
```bash
go mod download
```

3. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB** (using Docker):
```bash
docker-compose up -d mongodb
```

5. **Generate GraphQL code**:
```bash
make generate
# or
go run github.com/99designs/gqlgen generate
```

6. **Run the backend**:
```bash
make run
# or
go run cmd/server/main.go
```

Backend will start at `http://localhost:8080`
GraphQL Playground: `http://localhost:8080/playground`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**:
```bash
cp .env.local.example .env.local
```

4. **Run the frontend**:
```bash
npm run dev
# or
pnpm dev
```

Frontend will start at `http://localhost:3000`

## 🔑 Environment Variables

### Backend (.env)

```env
# Server
PORT=8080
ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/devthreads
MONGODB_DATABASE=devthreads

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URL=http://localhost:8080/auth/github/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:8080/graphql
```

## 📖 API Documentation

### Authentication

```graphql
# Signup
mutation {
  signup(input: {
    username: "johndoe"
    email: "john@example.com"
    password: "password123"
    displayName: "John Doe"
  }) {
    accessToken
    refreshToken
    user {
      id
      username
      reputation
    }
  }
}

# Login
mutation {
  login(input: {
    email: "john@example.com"
    password: "password123"
  }) {
    accessToken
    refreshToken
    user {
      id
      username
    }
  }
}
```

### Posts

```graphql
# Create Post
mutation {
  createPost(input: {
    content: "Just learned about Go channels!"
    codeSnippet: "ch := make(chan int)"
    language: "go"
    tags: ["golang", "concurrency"]
  }) {
    id
    content
    author {
      username
    }
  }
}

# Feed
query {
  feed(filter: LATEST, limit: 20) {
    posts {
      id
      content
      author {
        username
        reputation
      }
      likesCount
      commentsCount
    }
  }
}
```

### Reels

```graphql
# Create Reel
mutation {
  createReel(input: {
    title: "React Hooks Explained"
    videoUrl: "https://res.cloudinary.com/..."
    duration: 45
    tags: ["react", "hooks"]
  }) {
    id
    title
    videoUrl
  }
}
```

## 🎮 Usage

### For Users

1. **Sign Up**: Create an account at `/signup`
2. **Login**: Sign in at `/` (root page)
3. **Post**: Share DevTweets with code snippets
4. **Create Reels**: Upload short coding videos
5. **Engage**: Like, upvote, comment on posts
6. **Earn Rep**: Gain reputation points through engagement
7. **Profile**: View and edit your profile at `/profile`

### For Admins

1. **Access Admin Portal**: Navigate to `/admin` (requires admin role)
2. **View Analytics**: Monitor user activity, posts, and engagement
3. **Moderate Content**: Delete inappropriate posts/reels
4. **Manage Users**: Ban/unban users, manage reputation
5. **View Logs**: Track all moderation actions

## 🐳 Docker Deployment

### Full Stack with Docker Compose

```bash
# Backend
cd backend
docker-compose up -d

# Or build and run manually
docker build -t devthreads-backend .
docker run -p 8080:8080 --env-file .env devthreads-backend
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
make test
# or
go test -v ./...
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: Short-lived access tokens + long-lived refresh tokens
- **CORS**: Configured for frontend origin
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Prevents abuse (configurable)
- **Admin Authorization**: Protected admin routes

## 🎨 UI Features

- **Dark Mode**: Sleek dark theme optimized for developers
- **Responsive**: Works on mobile, tablet, and desktop
- **Real-time Updates**: Live comments and likes
- **Code Highlighting**: Syntax-highlighted code blocks
- **Animations**: Smooth transitions and interactions
- **Loading States**: Clear feedback for async operations

## 📊 Gamification System

### Reputation Points

- +5 for creating a post
- +2 for receiving a like
- +1 for unique daily view
- +10 for a reel reaching 100 likes

### Level System

- Level calculated from reputation (Rep / 100)
- Visual progress bars in sidebar and profile

### Badges (Future)

- **Newbie**: 0 rep
- **Contributor**: 100 rep
- **Expert**: 1000 rep
- **Reel Star**: 100 likes on a reel

## 🛣️ Roadmap

- [ ] Email notifications
- [ ] Follow system
- [ ] Bookmarks/saved posts
- [ ] Search functionality
- [ ] Direct messaging
- [ ] Post editing
- [ ] Video player with controls
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ by developers, for developers.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- gqlgen for GraphQL code generation
- Tailwind CSS for beautiful styling
- MongoDB team for the database
- Cloudinary for media management

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@devthreads.com

---

**Happy Coding! 🚀**
