# Pharma-Link Backend

This is the backend API for the Pharma-Link application, a platform connecting pharmacists with pharmacy owners in Egypt. The platform facilitates recruitment, CV management, and product listing with a focus on near-expiry cosmetics.

## ✨ Features

- 🔐 Secure authentication system for pharmacists and pharmacy owners
- 👤 Profile management for both user types
- 🏪 Product management with stock tracking
- 🔍 Advanced product search functionality
- 📍 Location-based pharmacist search
- 📦 Store service for pharmacy owners
- 📄 CV management for pharmacists
- 🔄 Real-time notifications

## 🛠 Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL with PostGIS extension
- **ORM:** Prisma
- **Authentication:** JWT
- **Validation:** Express Validator
- **File Upload:** Multer
- **Testing:** Jest (coming soon)

## 🏗 Project Structure

```
backend/
├── src/
│   ├── api/                  # API routes and controllers
│   │   ├── auth/            # Authentication endpoints
│   │   ├── pharmacists/     # Pharmacist-related endpoints
│   │   ├── pharmacies/      # Pharmacy owner endpoints
│   │   └── store/           # Product store endpoints
│   ├── config/              # Configuration files
│   ├── middleware/          # Custom middleware
│   ├── types/               # TypeScript type definitions
│   └── server.ts            # Main application entry point
├── prisma/
│   └── schema.prisma       # Database schema
├── .env.example            # Environment variables example
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14+)
- PostGIS extension

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ozidan13/pharmalink.git
   cd pharmalink/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update the .env file with your configuration
   ```

4. Set up the database:
   ```bash
   # Run database migrations
   npx prisma migrate dev
   
   # Generate Prisma Client
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
   
   The API will be available at `http://localhost:5000`

## 📚 API Documentation

Detailed API documentation is available in the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) file.

## 🧪 Testing

To run tests:
```bash
npm test
```

## 🛡️ Security

- JWT authentication
- Input validation
- Rate limiting
- CORS protection
- Helmet for security headers

## 📦 Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start in production:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.