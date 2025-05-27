# Pharma-Link Backend

This is the backend API for the Pharma-Link application, a platform connecting pharmacists with pharmacy owners.

## Features

- Authentication system for pharmacists and pharmacy owners
- Profile management for both user types
- Product management for pharmacy owners
- Advanced product search functionality
- Location-based pharmacist search
- Subscription management for pharmacy owners

## Tech Stack

- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT for authentication

## Project Structure

```
src/
├── api/                  # API routes and controllers
│   ├── auth/             # Authentication endpoints
│   ├── pharmacists/      # Pharmacist-related endpoints
│   ├── pharmacies/       # Pharmacy owner-related endpoints
│   └── store/            # Product store endpoints
├── middleware/           # Express middleware
├── prisma/               # Prisma schema and migrations
└── server.ts            # Main application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/pharmalink"
PORT=5000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Run Prisma migrations:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

## API Documentation

Detailed API documentation is available in the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) file.

## Error Handling

The application uses a centralized error handling middleware that standardizes error responses across all endpoints. Custom error classes are available in `src/middleware/error.middleware.ts`.

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## License

This project is licensed under the MIT License.