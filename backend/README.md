# DevThreads Backend

A powerful GraphQL API for DevThreads - a developer microblog and DevReel platform.

## Features

- 🔐 JWT Authentication (Access + Refresh tokens)
- 🐙 GitHub OAuth integration
- 📝 Microblogs with code snippets
- 🎬 Short video reels (DevReels)
- 💬 Comments and replies
- ❤️ Likes, upvotes, and views
- 🏆 Gamification system (reputation & badges)
- 🔔 Real-time notifications
- 👨‍💼 Admin portal with analytics
- ☁️ Cloudinary integration for media uploads
- 🚀 GraphQL subscriptions for real-time updates

## Tech Stack

- **Language**: Go 1.21+
- **GraphQL**: gqlgen
- **Database**: MongoDB
- **Cache**: Redis (optional)
- **Auth**: JWT + GitHub OAuth
- **File Storage**: Cloudinary

## Getting Started

### Prerequisites

- Go 1.21 or higher
- MongoDB 5.0+
- Redis (optional, for caching)
- Cloudinary account (for video uploads)

### Installation

1. Clone the repository:
```bash
cd backend
```

2. Install dependencies:
```bash
make install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration

5. Generate GraphQL code:
```bash
make generate
```

6. Start MongoDB and Redis (using Docker):
```bash
make docker-up
```

7. Run the server:
```bash
make run
```

The server will start at `http://localhost:8080`

GraphQL Playground: `http://localhost:8080/playground`

## Project Structure

```
backend/
├── cmd/
│   └── server/          # Application entry point
├── config/              # Configuration management
├── graph/
│   ├── schema/          # GraphQL schema files
│   ├── resolver/        # GraphQL resolvers
│   ├── model/           # Generated GraphQL models
│   └── generated/       # Generated GraphQL code
├── internal/
│   ├── auth/            # Authentication logic
│   ├── database/        # Database connection
│   ├── middleware/      # HTTP middleware
│   ├── models/          # MongoDB models
│   └── repository/      # Data access layer
├── docker-compose.yml   # Docker services
├── Dockerfile           # Container definition
├── Makefile             # Build commands
└── gqlgen.yml           # GraphQL generator config
```

## API Documentation

### Authentication

#### Signup
```graphql
mutation {
  signup(input: {
    username: "johndoe"
    email: "john@example.com"
    password: "securepass123"
    displayName: "John Doe"
  }) {
    accessToken
    refreshToken
    user {
      id
      username
      email
    }
  }
}
```

#### Login
```graphql
mutation {
  login(input: {
    email: "john@example.com"
    password: "securepass123"
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

#### Create Post
```graphql
mutation {
  createPost(input: {
    content: "Just learned about Go generics!"
    codeSnippet: "func Print[T any](s []T) { ... }"
    language: "go"
    tags: ["golang", "programming"]
  }) {
    id
    content
    author {
      username
    }
  }
}
```

#### Feed
```graphql
query {
  feed(filter: LATEST, limit: 20) {
    posts {
      id
      content
      author {
        username
        avatarUrl
      }
      likesCount
      commentsCount
    }
    hasMore
    cursor
  }
}
```

### Reels

#### Create Reel
```graphql
mutation {
  createReel(input: {
    title: "Quick React Hook Tutorial"
    videoUrl: "https://cloudinary.com/..."
    duration: 45
    tags: ["react", "tutorial"]
  }) {
    id
    title
    videoUrl
  }
}
```

### Subscriptions

#### Real-time Comments
```graphql
subscription {
  commentAdded(postId: "123") {
    id
    content
    author {
      username
    }
  }
}
```

## Development

### Generate GraphQL Code

After modifying schema files:

```bash
make generate
```

### Run Tests

```bash
make test
```

### Docker Development

```bash
# Start all services
make docker-up

# View logs
make docker-logs

# Stop services
make docker-down
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `ENV` | Environment (development/production) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/devthreads` |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Optional |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | Optional |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Required for uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Required for uploads |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Required for uploads |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |

## Admin Features

The admin portal includes:

- User management (ban/unban, reputation management)
- Content moderation (delete posts/reels/comments)
- Analytics dashboard
- Moderation logs
- Trending content overview

Access admin queries by including `isAdmin: true` in JWT claims.

## Deployment

### Build

```bash
make build
```

### Docker Production

```bash
docker build -t devthreads-backend .
docker run -p 8080:8080 --env-file .env devthreads-backend
```

## License

MIT

## Contributing

Pull requests are welcome! Please read the contributing guidelines first.

## Support

For issues and questions, please open an issue on GitHub.
