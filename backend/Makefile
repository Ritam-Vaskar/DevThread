.PHONY: help install generate run build test clean docker-up docker-down migrate

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	go mod download
	go mod tidy

generate: ## Generate GraphQL code
	go run github.com/99designs/gqlgen generate

run: ## Run the server
	go run cmd/server/main.go

build: ## Build the server
	go build -o bin/server cmd/server/main.go

test: ## Run tests
	go test -v ./...

clean: ## Clean build artifacts
	rm -rf bin/
	rm -rf graph/generated/

docker-up: ## Start Docker containers
	docker-compose up -d

docker-down: ## Stop Docker containers
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

dev: ## Run in development mode with hot reload
	air

lint: ## Run linter
	golangci-lint run
