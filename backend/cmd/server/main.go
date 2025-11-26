package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/devthreads/backend/config"
	"github.com/devthreads/backend/graph/generated"
	"github.com/devthreads/backend/graph/resolver"
	"github.com/devthreads/backend/internal/auth"
	"github.com/devthreads/backend/internal/database"
	"github.com/devthreads/backend/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize configuration
	cfg := config.Load()

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := database.Connect(ctx, cfg.MongoURI)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer db.Disconnect(context.Background())

	log.Println("Connected to MongoDB successfully")

	// Initialize services
	authService := auth.NewService(cfg.JWTSecret, cfg.JWTAccessExpiry, cfg.JWTRefreshExpiry)

	// Initialize resolver with dependencies
	resolverRoot := &resolver.Resolver{
		DB:          db,
		AuthService: authService,
		Config:      cfg,
	}

	// Create GraphQL server
	srv := handler.New(generated.NewExecutableSchema(generated.Config{
		Resolvers: resolverRoot,
	}))

	// Add transports
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins for development
			},
		},
	})

	// Add extensions
	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: &MapCache{},
	})

	// Initialize Gin router
	r := gin.Default()

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL, "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "timestamp": time.Now().Unix()})
	})

	// GitHub OAuth routes
	r.GET("/auth/github", func(c *gin.Context) {
		url := authService.GetGithubOAuthURL(cfg.GithubClientID, cfg.GithubRedirectURL)
		c.Redirect(http.StatusTemporaryRedirect, url)
	})

	r.GET("/auth/github/callback", func(c *gin.Context) {
		code := c.Query("code")
		if code == "" {
			c.JSON(400, gin.H{"error": "code parameter is required"})
			return
		}

		// Handle GitHub OAuth callback
		// This will be implemented in the resolver
		c.Redirect(http.StatusTemporaryRedirect, cfg.FrontendURL+"/auth/callback?code="+code)
	})

	// GraphQL playground (development only)
	if cfg.Environment == "development" {
		r.GET("/playground", gin.WrapH(playground.Handler("GraphQL Playground", "/graphql")))
		log.Println("GraphQL Playground available at: http://localhost:" + cfg.Port + "/playground")
	}

	// GraphQL endpoint with authentication middleware
	r.POST("/graphql", middleware.AuthMiddleware(authService), gin.WrapH(srv))
	r.GET("/graphql", middleware.AuthMiddleware(authService), gin.WrapH(srv))

	// Start server
	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Printf("GraphQL endpoint: http://localhost:%s/graphql", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// MapCache is a simple in-memory cache for APQ
type MapCache struct {
	data map[string]interface{}
}

func (m *MapCache) Get(ctx context.Context, key string) (interface{}, bool) {
	if m.data == nil {
		return nil, false
	}
	val, ok := m.data[key]
	return val, ok
}

func (m *MapCache) Add(ctx context.Context, key string, value interface{}) {
	if m.data == nil {
		m.data = make(map[string]interface{})
	}
	m.data[key] = value
}
