# Property Management Backend System

A comprehensive backend system for managing property listings, built with Node.js, TypeScript, Express, MongoDB, and Redis.

## Features

- **User Authentication**: Registration, login, and JWT-based authentication
- **Property Management**: Complete CRUD operations for property listings
- **Advanced Filtering & Search**: Filter properties by multiple criteria
- **Caching with Redis**: Improve performance for common queries
- **Favorites System**: Users can save and manage their favorite properties
- **Recommendation System**: Users can recommend properties to other users

## Tech Stack

- **Node.js & TypeScript**: For a type-safe backend implementation
- **Express.js**: Web framework for handling HTTP requests
- **MongoDB**: Database for storing property listings and user data
- **Redis**: For caching frequently accessed data
- **JWT**: For secure authentication

## Setup & Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Redis (local or remote)

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Server Port
PORT=5000

# MongoDB connection string (update as needed)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster-journal-ai.qokch.mongodb.net/propertyDB?retryWrites=true&w=majority&appName=Cluster-journal-ai

# JWT Secret (Make sure to change this in production!)
JWT_SECRET=your_jwt_secret_key_change_in_production

# Redis Cloud Configuration
REDIS_HOST=redis-18166.c81.us-east-1-2.ec2.redns.redis-cloud.com
REDIS_PORT=18166
REDIS_USERNAME=default                      # Optional: use if your Redis Cloud requires username
REDIS_PASSWORD=your_redis_cloud_password   # Replace with your Redis Cloud password

# Environment
NODE_ENV=development

```

### Installation

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Start the server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get JWT token
- `GET /api/auth/profile`: Get current user profile (protected)

### Properties

- `GET /api/properties`: Get all properties with filtering
- `GET /api/properties/:id`: Get property by ID
- `POST /api/properties`: Create a new property (protected)
- `PUT /api/properties/:id`: Update a property (protected, owner only)
- `DELETE /api/properties/:id`: Delete a property (protected, owner only)
- `GET /api/properties/search`: Search properties by query string

### Favorites

- `POST /api/favorites`: Add property to favorites (protected)
- `DELETE /api/favorites/:propertyId`: Remove from favorites (protected)
- `GET /api/favorites`: Get user's favorites (protected)
- `GET /api/favorites/check/:propertyId`: Check if in favorites (protected)

### Recommendations

- `POST /api/recommendations`: Create recommendation (protected)
- `GET /api/recommendations/received`: Get received recommendations (protected)
- `GET /api/recommendations/sent`: Get sent recommendations (protected)
- `PUT /api/recommendations/:id/read`: Mark as read (protected)
- `DELETE /api/recommendations/:id`: Delete recommendation (protected)

## Database Schema

- **User**: Authentication and profile information
- **Property**: Property listing details
- **Favorite**: User-property relationship for favorites
- **Recommendation**: User-to-user property recommendations

## Caching Strategy

Redis is used to cache:
- Property listing results for 60 seconds
- Individual property details for 5 minutes
- User favorites for 60 seconds

## Error Handling

The API implements centralized error handling with appropriate HTTP status codes and error messages.
