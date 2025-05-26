# Pharma-Link Egypt: Detailed Project Implementation Plan

**Project Goal:** To develop "Pharma-Link Egypt," a specialized web platform connecting pharmacists (especially recent graduates) with pharmacy owners in Egypt. The platform includes recruitment features, CV management, geographically-scoped search, and a "Store Service" for pharmacy owners to list products, particularly near-expiry cosmetics.

**Core Technologies Reminder 
* **Frontend:** Next.js latest verion 15 or later (React) 19 or later , Tailwind CSS
* **Backend:** Express.js (TypeScript), Prisma ORM
* **Database:** PostgreSQL with PostGIS extension
* **Authentication:** JWT

---

## Phase 0: Project Setup & Core Architecture

### Step 0.1: Project Initialization & Folder Structure
**Agent Task:** Initialize a monorepo or two separate project folders (`backend` and `frontend`) and set up the basic directory structure for each.

**Details:**
1.  **Create a root project directory:** `pharma-link-egypt`
2.  Inside `pharma-link-egypt`, create two subdirectories:
    * `backend`: For the Express.js API.
    * `frontend`: For the Next.js application.
3.  **Backend Folder Structure (`backend`):**
    ```
    /backend
    ├── src/
    │   ├── api/             # API routes/controllers
    │   │   ├── auth/
    │   │   ├── pharmacists/
    │   │   ├── pharmacies/
    │   │   └── store/
    │   ├── config/          # Environment variables, database config
    │   ├── middleware/      # Custom middleware (auth, error handling)
    │   ├── services/        # Business logic
    │   ├── utils/           # Utility functions
    │   └── server.ts        # Express app entry point
    ├── prisma/
    │   └── schema.prisma    # Prisma schema file
    ├── package.json
    ├── tsconfig.json
    └── .env.example
    ```
4.  **Frontend Folder Structure (`frontend`):**
    ```
    /frontend
    ├── app/                 # Next.js App Router
    │   ├── (auth)/          # Authentication pages (login, register)
    │   │   └── login/
    │   │   └── register/
    │   ├── (dashboard)/     # Protected dashboard routes
    │   │   ├── pharmacist/
    │   │   └── pharmacy-owner/
    │   ├── api/             # Next.js API routes (if any, primarily for NextAuth or BFF)
    │   └── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── ui/              # Reusable UI components (buttons, inputs, cards)
    │   ├── layout/          # Layout components (navbar, footer, sidebar)
    │   └── features/        # Feature-specific components
    ├── contexts/            # React Context (if used for state management)
    ├── hooks/               # Custom React hooks
    ├── lib/                 # Utility functions, API client
    ├── public/              # Static assets
    ├── styles/
    │   └── globals.css      # Global styles
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── tailwind.config.js
    └── postcss.config.js
    └── .env.local.example
    ```
5.  Initialize `git` in the root `pharma-link-egypt` directory. Create an initial `.gitignore` file covering Node.js, Next.js, and Prisma artifacts.

**Agent Checkpoint:** Confirm folder structures are created as specified.

### Step 0.2: Environment Variables Setup
**Agent Task:** Define and set up environment variables for both backend and frontend.

**Details:**
1.  **Backend (`backend/.env.example`):**
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    POSTGIS_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE" # If PostGIS needs separate handling or for reference
    JWT_SECRET="your-super-secret-jwt-key"
    JWT_EXPIRES_IN="1d" # Example: 1 day
    PORT=5000
    # Add any other necessary backend variables (e.g., cloud storage keys, email service keys)
    ```
2.  **Frontend (`frontend/.env.local.example`):**
    ```
    NEXT_PUBLIC_API_URL="http://localhost:5000/api" # URL of the backend API
    # NEXTAUTH_URL="http://localhost:3000" # If using NextAuth
    # NEXTAUTH_SECRET="your-nextauth-secret" # If using NextAuth
    # Add any other necessary frontend public variables
    ```
3.  **Instructions for AI Agent:**
    * Create `.env` (for backend) and `.env.local` (for frontend) files by copying the `.example` files.
    * Advise the user to fill in the actual secret values in their local `.env` files (these should not be committed to git).

**Agent Checkpoint:** Confirm `.env.example` files are created and instructions for local `.env` files are clear.

### Step 0.3: Core Technology Choices & Justification (Reiteration for Agent Context)
**Agent Task:** Re-confirm understanding of the core technologies. This step is for context reinforcement.

**Details:**
* **Backend:** Express.js with TypeScript for a robust, type-safe API. Prisma as the ORM for PostgreSQL to simplify database interactions. PostgreSQL with PostGIS extension for powerful geospatial querying capabilities (critical for location-based search).
* **Frontend:** Next.js (App Router) for a modern, performant React framework with SSR/SSG capabilities. Tailwind CSS for utility-first styling.
* **Authentication:** JWT-based authentication for secure stateless sessions between frontend and backend.
* **Key Goal:** The agent's primary objective is to implement the features outlined in the project brief, ensuring each component (pharmacist portal, pharmacy owner portal, store service) is functional and interacts correctly.

**Agent Checkpoint:** Agent acknowledges understanding of the tech stack and project goals.

---

## Phase 1: Backend Development (Express.js, Prisma, PostgreSQL)

### Step 1.1: Database Schema Design (PostgreSQL with PostGIS)
**Agent Task:** Design the database schema and write the `schema.prisma` file. Ensure PostGIS compatibility for location data.

**Details:**
1.  **Enable PostGIS extension:** Ensure the PostgreSQL database has the PostGIS extension enabled. (This might be a manual step for the user or a command if using a managed DB service that supports it via CLI/console).
    ```sql
    -- Run this in your PostgreSQL database if not already enabled
    -- CREATE EXTENSION IF NOT EXISTS postgis;
    ```
2.  **Define `schema.prisma` (`backend/prisma/schema.prisma`):**
    ```prisma
    // This is your Prisma schema file,
    // learn more about it in the docs: [https://pris.ly/d/prisma-schema](https://pris.ly/d/prisma-schema)

    generator client {
      provider = "prisma-client-js"
    }

    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }

    enum UserRole {
      PHARMACIST
      PHARMACY_OWNER
    }

    model User {
      id            String    @id @default(cuid())
      email         String    @unique
      password      String
      role          UserRole
      createdAt     DateTime  @default(now())
      updatedAt     DateTime  @updatedAt
      pharmacistProfile PharmacistProfile?
      pharmacyOwnerProfile PharmacyOwnerProfile?
    }

    model PharmacistProfile {
      id          String  @id @default(cuid())
      userId      String  @unique
      user        User    @relation(fields: [userId], references: [id])
      firstName   String
      lastName    String
      phoneNumber String?
      cvUrl       String? // URL to the stored CV file
      bio         String?
      experience  String? // Could be structured JSON or text
      education   String? // Could be structured JSON or text
      // For location, store latitude and longitude for PostGIS queries
      latitude    Float?
      longitude   Float?
      // Prisma doesn't directly support PostGIS types like 'Point'.
      // We store lat/lon and query using raw SQL with PostGIS functions.
      // Or, use a PostGIS-compatible extension for Prisma if available and stable.
      // For now, we'll assume raw SQL queries for geospatial search.
      available   Boolean @default(true) // Availability status
      createdAt   DateTime @default(now())
      updatedAt   DateTime @updatedAt
    }

    model PharmacyOwnerProfile {
      id            String    @id @default(cuid())
      userId        String    @unique
      user          User      @relation(fields: [userId], references: [id])
      pharmacyName  String
      contactPerson String
      phoneNumber String?
      address       String?
      // For location of the pharmacy
      latitude      Float?
      longitude     Float?
      subscriptionStatus String @default("none") // e.g., none, basic, premium
      subscriptionExpiresAt DateTime?
      createdAt     DateTime  @default(now())
      updatedAt     DateTime  @updatedAt
      products      Product[]
    }

    model Product {
      id            String    @id @default(cuid())
      name          String
      description   String?
      price         Float
      category      String    // e.g., Cosmetics, Healthcare
      isNearExpiry  Boolean   @default(false)
      expiryDate    DateTime?
      imageUrl      String?
      stock         Int       @default(0)
      pharmacyOwnerId String
      pharmacyOwner PharmacyOwnerProfile @relation(fields: [pharmacyOwnerId], references: [id])
      createdAt     DateTime  @default(now())
      updatedAt     DateTime  @updatedAt
    }
    ```
3.  **Note on PostGIS:**
    * Prisma has limited native support for PostGIS-specific data types. The common approach is to store latitude and longitude as `Float` and then use Prisma's `$queryRaw` or `$executeRaw` for geospatial queries (e.g., finding pharmacists within a radius).
    * The agent should be aware of this limitation and prepare to implement search logic accordingly.

**Agent Checkpoint:** `schema.prisma` file created. Understanding of PostGIS handling with Prisma confirmed.

### Step 1.2: Prisma Setup & Migrations
**Agent Task:** Install Prisma, initialize it, and run the first migration to create the database tables.

**Details:**
1.  **Navigate to `backend` directory.**
2.  **Install Prisma CLI and Client:**
    ```bash
    npm install prisma --save-dev
    npm install @prisma/client
    ```
3.  **Initialize Prisma:**
    ```bash
    npx prisma init 
    ```
    (This creates the `prisma` folder and `schema.prisma` if it doesn't exist, and the `.env` file for `DATABASE_URL`).
4.  **Run Prisma Migrate:**
    * Ensure `DATABASE_URL` in `.env` is correctly configured for your PostgreSQL database.
    * Create the first migration:
        ```bash
        npx prisma migrate dev --name init
        ```
    * This will create the tables in your database based on `schema.prisma`.
5.  **Generate Prisma Client:**
    ```bash
    npx prisma generate
    ```
    (This generates the Prisma Client based on your schema, allowing you to interact with the database in a type-safe way).

**Agent Checkpoint:** Prisma initialized, first migration successful, Prisma Client generated.

### Step 1.3: User Authentication (Pharmacist & Pharmacy Owner Roles) - API Endpoints
**Agent Task:** Implement user registration and login functionality, handling different roles and using JWT for sessions.

**Details:**
1.  **Location:** `backend/src/api/auth/`
2.  **Install necessary packages:** `bcryptjs` for password hashing, `jsonwebtoken` for JWT.
    ```bash
    npm install bcryptjs jsonwebtoken
    npm install --save-dev @types/bcryptjs @types/jsonwebtoken
    ```
3.  **Create `auth.controller.ts` and `auth.service.ts` (or similar structure).**
4.  **Endpoints to implement:**
    * **`POST /api/auth/register/pharmacist`**:
        * Input: `email`, `password`, `firstName`, `lastName`, etc.
        * Logic: Hash password, create `User` with `PHARMACIST` role, create `PharmacistProfile`.
        * Output: JWT token, user info.
    * **`POST /api/auth/register/pharmacy-owner`**:
        * Input: `email`, `password`, `pharmacyName`, `contactPerson`, etc.
        * Logic: Hash password, create `User` with `PHARMACY_OWNER` role, create `PharmacyOwnerProfile`.
        * Output: JWT token, user info.
    * **`POST /api/auth/login`**:
        * Input: `email`, `password`.
        * Logic: Find user, compare hashed password, generate JWT token.
        * Output: JWT token, user info (including role).
5.  **JWT Generation and Verification:**
    * Use `JWT_SECRET` and `JWT_EXPIRES_IN` from environment variables.
    * Create middleware (`backend/src/middleware/auth.middleware.ts`) to protect routes by verifying JWT. This middleware should attach user information (ID, role) to the request object.
6.  **Password Hashing:** Use `bcryptjs` to hash passwords before storing and compare during login.
7.  **Input Validation:** Use a library like `express-validator` or `zod` for robust input validation.

**Agent Checkpoint:** Registration and login endpoints for both roles implemented and tested. JWT authentication middleware created.

### Step 1.4: Pharmacist Profile Management - API Endpoints
**Agent Task:** Implement CRUD operations for pharmacist profiles.

**Details:**
1.  **Location:** `backend/src/api/pharmacists/`
2.  **Protected Routes:** These routes should be protected by the JWT authentication middleware and accessible only by authenticated pharmacists (for their own profile) or relevant pharmacy owners (for viewing).
3.  **Endpoints to implement:**
    * **`GET /api/pharmacists/me`**:
        * Auth: Pharmacist only.
        * Logic: Fetch the profile of the currently logged-in pharmacist.
        * Output: Pharmacist profile data.
    * **`PUT /api/pharmacists/me`**:
        * Auth: Pharmacist only.
        * Input: Fields to update (firstName, lastName, phoneNumber, bio, experience, education, latitude, longitude, available).
        * Logic: Update the profile of the currently logged-in pharmacist.
        * Output: Updated pharmacist profile data.
    * **`GET /api/pharmacists/:id`**: (For pharmacy owners to view a specific profile)
        * Auth: Pharmacy Owner (potentially with subscription checks).
        * Logic: Fetch a pharmacist profile by ID.
        * Output: Pharmacist profile data (excluding sensitive info if necessary).
    * **`POST /api/pharmacists/me/cv`**: (Handled in Step 1.6)

**Agent Checkpoint:** Pharmacist profile CRUD endpoints implemented and tested with appropriate authorization.

### Step 1.5: Pharmacy Owner Profile Management & Subscription Logic - API Endpoints
**Agent Task:** Implement CRUD for pharmacy owner profiles and basic subscription status logic.

**Details:**
1.  **Location:** `backend/src/api/pharmacies/` (or `pharmacy-owners`)
2.  **Protected Routes:** JWT authentication, accessible by authenticated pharmacy owners for their own profile.
3.  **Endpoints to implement:**
    * **`GET /api/pharmacy-owners/me`**:
        * Auth: Pharmacy Owner only.
        * Logic: Fetch profile of the logged-in pharmacy owner.
        * Output: Pharmacy owner profile data.
    * **`PUT /api/pharmacy-owners/me`**:
        * Auth: Pharmacy Owner only.
        * Input: Fields to update (pharmacyName, contactPerson, phoneNumber, address, latitude, longitude).
        * Logic: Update profile of the logged-in pharmacy owner.
        * Output: Updated pharmacy owner profile data.
    * **`POST /api/pharmacy-owners/me/subscribe`**: (Simplified for now, full payment integration later)
        * Auth: Pharmacy Owner only.
        * Input: `planType` (e.g., "basic", "premium").
        * Logic: Update `subscriptionStatus` and `subscriptionExpiresAt` for the user. In a real app, this would involve a payment gateway.
        * Output: Updated subscription status.

**Agent Checkpoint:** Pharmacy owner profile CRUD and basic subscription update endpoint implemented.

### Step 1.6: CV Management (Upload, Storage, Retrieval) - API Endpoints
**Agent Task:** Implement CV upload functionality for pharmacists.

**Details:**
1.  **Choose a storage strategy:**
    * **Cloud Storage (Recommended):** AWS S3, Google Cloud Storage, Cloudinary. Requires SDKs and configuration.
    * **Local File System (Simpler for Dev):** Store files on the server. Not suitable for production scaling.
    * **Agent should aim for cloud storage if feasible, or implement local storage with a clear note about production readiness.**
2.  **Install `multer` (or similar) for handling file uploads in Express.**
    ```bash
    npm install multer
    npm install --save-dev @types/multer
    ```
3.  **Endpoint:**
    * **`POST /api/pharmacists/me/cv`**:
        * Auth: Pharmacist only.
        * Input: File upload (PDF, DOCX).
        * Logic:
            * Use `multer` to process the file.
            * Upload to chosen storage (e.g., S3).
            * Save the file URL or identifier to the `PharmacistProfile` (`cvUrl`).
        * Output: Success message, updated `cvUrl`.
4.  **Retrieval:** The `cvUrl` will be part of the pharmacist profile data, so frontend can use it to allow downloads.

**Agent Checkpoint:** CV upload endpoint implemented. File is stored (locally or cloud) and URL saved to profile.

### Step 1.7: Geo-Fenced Candidate Search Logic & API Endpoint (PostGIS)
**Agent Task:** Implement the API endpoint for pharmacy owners to search for pharmacists based on location and other criteria.

**Details:**
1.  **Endpoint:**
    * **`GET /api/pharmacists/search`**:
        * Auth: Pharmacy Owner (check `subscriptionStatus` to determine search radius/access level).
        * Query Parameters:
            * `latitude` (pharmacy's latitude)
            * `longitude` (pharmacy's longitude)
            * `radius` (search radius in kilometers, may depend on subscription tier)
            * Other filters: `availability`, `experienceLevel` (if added to schema).
        * Logic:
            * Use Prisma's `$queryRawUnsafe` or a similar method to execute a PostGIS query.
            * The PostGIS query should find pharmacists within the specified radius of the given coordinates.
            * Example PostGIS function: `ST_DWithin` (geography, geography, distance_meters).
            * `ST_MakePoint(longitude, latitude)::geography` to create points.
            * Filter by `available: true`.
            * Apply other filters.
        * Output: List of matching pharmacist profiles.
2.  **Prisma Raw Query Example (Conceptual):**
    ```typescript
    // In your service file
    const pharmacists = await prisma.$queryRawUnsafe(
      `SELECT id, "firstName", "lastName", "cvUrl", latitude, longitude, 
       ST_Distance(
         ST_MakePoint(longitude, latitude)::geography, 
         ST_MakePoint(${searchLng}, ${searchLat})::geography
       ) / 1000 AS distance_km 
       FROM "PharmacistProfile" 
       WHERE ST_DWithin(
         ST_MakePoint(longitude, latitude)::geography, 
         ST_MakePoint(${searchLng}, ${searchLat})::geography, 
         ${radiusKm * 1000}
       ) AND available = true
       ORDER BY distance_km ASC;`
    );
    // Note: Ensure proper SQL injection prevention if constructing queries with template literals.
    // Using Prisma's template tag version ($queryRaw`...`) is safer.
    ```
    The agent should adapt this to use Prisma's safer template literal raw queries.

**Agent Checkpoint:** Geospatial search endpoint implemented using PostGIS via Prisma raw queries. Subscription-based access logic considered.

### Step 1.8: Store Service - Product Listing (Cosmetics, Near-Expiry) - API Endpoints
**Agent Task:** Implement CRUD operations for products listed by pharmacy owners.

**Details:**
1.  **Location:** `backend/src/api/store/`
2.  **Protected Routes:** JWT authentication, accessible by authenticated pharmacy owners for their own products.
3.  **Endpoints to implement:**
    * **`POST /api/store/products`**:
        * Auth: Pharmacy Owner only.
        * Input: `name`, `description`, `price`, `category`, `isNearExpiry`, `expiryDate`, `stock`, `imageUrl` (optional).
        * Logic: Create a new `Product` associated with the logged-in pharmacy owner.
        * Output: Created product data.
    * **`GET /api/store/products/my-products`**:
        * Auth: Pharmacy Owner only.
        * Logic: List all products for the logged-in pharmacy owner.
        * Output: List of products.
    * **`GET /api/store/products`**: (Public or for other pharmacy owners to browse, TBD by platform rules)
        * Logic: List all products, potentially with filters (category, near-expiry).
        * Output: List of products.
    * **`GET /api/store/products/:id`**:
        * Logic: Get a specific product by ID.
        * Output: Product data.
    * **`PUT /api/store/products/:id`**:
        * Auth: Pharmacy Owner (must own the product).
        * Input: Fields to update.
        * Logic: Update the product.
        * Output: Updated product data.
    * **`DELETE /api/store/products/:id`**:
        * Auth: Pharmacy Owner (must own the product).
        * Logic: Delete the product.
        * Output: Success message.
4.  **Product Image Upload:** Similar to CV upload (Step 1.6), if `imageUrl` involves uploading files.

**Agent Checkpoint:** Store service product CRUD endpoints implemented.

### Step 1.9: API Security, Validation, and Error Handling
**Agent Task:** Implement robust security measures, input validation, and consistent error handling.

**Details:**
1.  **Input Validation:**
    * Use `express-validator`, `zod`, or `joi` for all incoming request bodies and parameters.
    * Ensure data types, required fields, string lengths, email formats, etc., are validated.
2.  **Error Handling Middleware:**
    * Create a global error handling middleware in Express.
    * Catch errors from route handlers and services.
    * Send consistent JSON error responses with appropriate HTTP status codes (e.g., 400 for bad request, 401 for unauthorized, 403 for forbidden, 404 for not found, 500 for server error).
3.  **Security Headers:**
    * Use `helmet` middleware for setting various HTTP headers to improve security (XSS protection, content security policy basics, etc.).
    * `npm install helmet`
4.  **Rate Limiting:**
    * Consider `express-rate-limit` to prevent abuse of API endpoints.
    * `npm install express-rate-limit`
5.  **CORS:**
    * Configure CORS properly using the `cors` middleware to allow requests from your Next.js frontend.
    * `npm install cors`
    * `app.use(cors({ origin: 'http://localhost:3000' }));` (Adjust origin for production)
6.  **Logging:** Implement basic logging (e.g., using `morgan` for HTTP requests, and a simple logger like `winston` or `pino` for application events/errors).

**Agent Checkpoint:** Input validation, global error handler, security middleware (helmet, cors, rate-limiting) implemented.

---

## Phase 2: Frontend Development (Next.js)

**Agent Task Context:** The agent will now switch to the `frontend` directory and build the Next.js application. It needs to interact with the backend API endpoints created in Phase 1.

### Step 2.1: Next.js Project Setup & Tailwind CSS Integration
**Agent Task:** Create a new Next.js project and integrate Tailwind CSS.

**Details:**
1.  **Navigate to `frontend` directory.**
2.  **Create Next.js App (App Router, TypeScript):**
    ```bash
    npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
    ```
    (Answer prompts as needed; the command above sets common preferences).
3.  **Verify Tailwind CSS Setup:**
    * Check `tailwind.config.js`, `postcss.config.js`, and `styles/globals.css`.
    * Ensure Tailwind directives are in `globals.css`:
        ```css
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        ```
4.  **Basic Font Setup:**
    * Choose a font (e.g., Inter, Tajawal for Arabic if needed later) and configure it in `app/layout.tsx` and `tailwind.config.js`.
    * The provided brief uses "Inter" and "Tajawal". For now, focus on "Inter".

**Agent Checkpoint:** Next.js project created with TypeScript, App Router, and Tailwind CSS configured.

### Step 2.2: Global Layout, Navigation, and Footer Components
**Agent Task:** Create the main layout structure, including a responsive navbar and footer.

**Details:**
1.  **Main Layout (`app/layout.tsx`):**
    * This file already exists. Modify it to include a global Navbar and Footer.
    * Wrap `children` with Navbar and Footer.
2.  **Navbar Component (`components/layout/Navbar.tsx`):**
    * Responsive design.
    * Links: Home, Login, Register.
    * Conditional links based on auth state: Dashboard, Logout.
    * Use Tailwind CSS for styling.
3.  **Footer Component (`components/layout/Footer.tsx`):**
    * Basic footer with copyright information.
    * Use Tailwind CSS.
4.  **Styling:** Apply basic Material Design aesthetics (cards, elevation where appropriate) using Tailwind. Use the "Energetic & Playful" color palette (Primary: `#FF6B6B`, Secondary: `#FFD166`, Accent: `#06D6A0`, Neutral Dark: `#118AB2`, Neutral Light: `#F7F7F7`, Text: `#073B4C`) consistently.
    * Define these colors in `tailwind.config.js` for easy reuse.
    ```javascript
    // tailwind.config.js
    module.exports = {
      // ...
      theme: {
        extend: {
          colors: {
            primary: '#FF6B6B',
            secondary: '#FFD166',
            accent: '#06D6A0',
            'neutral-dark': '#118AB2',
            'neutral-light': '#F7F7F7',
            'text-main': '#073B4C',
          },
        },
      },
      // ...
    }
    ```

**Agent Checkpoint:** Global layout with Navbar and Footer components created and styled. Colors configured in Tailwind.

### Step 2.3: User Authentication UI (Login, Registration for both roles)
**Agent Task:** Create UI pages and forms for user login and registration.

**Details:**
1.  **Pages (App Router):**
    * `app/(auth)/login/page.tsx`
    * `app/(auth)/register/pharmacist/page.tsx`
    * `app/(auth)/register/pharmacy-owner/page.tsx`
2.  **Forms:**
    * Create reusable form input components (`components/ui/Input.tsx`, `components/ui/Button.tsx`).
    * Implement forms for:
        * Login (email, password).
        * Pharmacist Registration (email, password, firstName, lastName, etc.).
        * Pharmacy Owner Registration (email, password, pharmacyName, contactPerson, etc.).
3.  **API Calls:**
    * On form submission, make API calls to the backend authentication endpoints (Step 1.3).
    * Use `fetch` or a library like `axios`. Create an API client helper (`lib/apiClient.ts`).
4.  **State Management for Auth:**
    * Use React Context or Zustand to manage user authentication state (token, user details, role).
    * Store JWT in `localStorage` or `sessionStorage` (or HTTP-only cookies if using NextAuth with backend adapter). For simplicity with JWT direct from Express, `localStorage` is common.
    * Create an `AuthContext` that provides user info and login/logout functions. Wrap the main layout with this provider.
5.  **Routing:** Redirect users after successful login/registration (e.g., to their respective dashboards). Protect dashboard routes.

**Agent Checkpoint:** Login and registration pages/forms created. API calls for auth implemented. Auth state management set up.

### Step 2.4: Pharmacist Dashboard UI
**Agent Task:** Create the main dashboard layout and profile management UI for pharmacists.

**Details:**
1.  **Protected Route & Layout:**
    * `app/(dashboard)/pharmacist/layout.tsx` (sidebar, dashboard-specific navbar).
    * `app/(dashboard)/pharmacist/page.tsx` (main dashboard overview).
    * Implement route protection: redirect to login if not authenticated or not a pharmacist.
2.  **Profile Management (`app/(dashboard)/pharmacist/profile/page.tsx`):**
    * Display current profile information.
    * Form to edit profile details (firstName, lastName, bio, location - potentially with a map interface for lat/lon selection if time permits, or simple input fields).
    * API calls to `GET /api/pharmacists/me` and `PUT /api/pharmacists/me`.
3.  **CV Upload Interface (`app/(dashboard)/pharmacist/cv/page.tsx`):**
    * File input for CV upload (PDF, DOCX).
    * Display current CV if uploaded (link to download).
    * API call to `POST /api/pharmacists/me/cv`.
    * Show upload progress and success/error messages.
4.  **(Optional) CV Builder Service UI:** If this feature is to be mocked or implemented, create a simple interface for it. The original brief mentioned it as a paid service, which implies more complexity. For now, a placeholder might suffice.

**Agent Checkpoint:** Pharmacist dashboard layout, profile management, and CV upload UI implemented and connected to backend.

### Step 2.5: Pharmacy Owner Dashboard UI
**Agent Task:** Create the dashboard UI for pharmacy owners, including candidate search, profile viewing, subscription, and store management.

**Details:**
1.  **Protected Route & Layout:**
    * `app/(dashboard)/pharmacy-owner/layout.tsx`
    * `app/(dashboard)/pharmacy-owner/page.tsx`
    * Route protection for pharmacy owners.
2.  **Candidate Search Interface (`app/(dashboard)/pharmacy-owner/search/page.tsx`):**
    * Input fields for search criteria: location (address input to be geocoded or direct lat/lon for simplicity), radius.
    * Filters for availability, etc.
    * Display search results as a list of pharmacist cards (name, brief info, link to full profile).
    * API call to `GET /api/pharmacists/search`.
    * **Geocoding:** If using address input, integrate a geocoding service (e.g., browser's Geolocation API for user's current location, or a service like Nominatim/Google Maps Geocoding API for address to lat/lon conversion - requires API key and careful usage). For simplicity, agent might start with lat/lon inputs.
3.  **Candidate Profile Viewing (`app/(dashboard)/pharmacy-owner/pharmacist/[id]/page.tsx`):**
    * Display full pharmacist profile details, including CV download link.
    * API call to `GET /api/pharmacists/:id`.
4.  **Subscription Management UI (`app/(dashboard)/pharmacy-owner/subscription/page.tsx`):**
    * Display current subscription status and expiry.
    * Buttons to "upgrade" or "subscribe" (calls `POST /api/pharmacy-owners/me/subscribe`).
    * Note: Full payment gateway integration is in Phase 3. This is for status display and basic updates.
5.  **Store Service UI - Product Listing & Management (`app/(dashboard)/pharmacy-owner/store/products/page.tsx`):**
    * Display list of owner's products.
    * Form to add/edit products (name, description, price, category, near-expiry toggle, expiry date, stock, image upload).
    * API calls to product CRUD endpoints (Step 1.8).
    * Product image upload similar to CV upload.
6.  **Store Service UI - Near-Expiry Product Highlighting:**
    * Ensure near-expiry products are visually distinct in the product list.
    * Filter options for near-expiry products.

**Agent Checkpoint:** Pharmacy owner dashboard UI for search, profile viewing, subscription, and store management implemented and connected.

### Step 2.6: Public Pages (Homepage, About, Contact - if any)
**Agent Task:** Create basic public-facing pages.

**Details:**
1.  **Homepage (`app/page.tsx`):**
    * Brief introduction to the platform.
    * Call to action buttons (Register as Pharmacist, Register as Pharmacy Owner, Browse Jobs - if public job browsing is a feature).
2.  **About Page (`app/about/page.tsx`):**
    * Information about Pharma-Link Egypt.
3.  **Contact Page (`app/contact/page.tsx`):**
    * Contact form or information.
    * (Agent: For a contact form, a simple backend endpoint might be needed, or use a third-party service like Formspree).

**Agent Checkpoint:** Basic public pages created.

### Step 2.7: State Management (Zustand/React Query) Integration
**Agent Task:** Refine state management, especially for server state and complex client state.

**Details:**
1.  **Server State with React Query (or SWR):**
    * Install `react-query`: `npm install @tanstack/react-query`
    * Wrap the application with `QueryClientProvider`.
    * Use `useQuery` for fetching data (e.g., profiles, product lists, search results).
    * Use `useMutation` for creating, updating, deleting data.
    * This will handle caching, refetching, loading/error states gracefully.
2.  **Client State with Zustand (or continue with React Context if simple):**
    * Install `zustand`: `npm install zustand`
    * Use Zustand for global client-side state not directly tied to server data (e.g., UI toggles, complex form states if not handled by form libraries, auth state if not already in Context).
    * Refactor `AuthContext` to use Zustand if preferred for simplicity and less boilerplate.

**Agent Checkpoint:** React Query integrated for server state. Client state management reviewed and potentially refactored with Zustand.

### Step 2.8: API Integration - Connecting Frontend to Backend Endpoints
**Agent Task:** Ensure all frontend components that require data are correctly fetching from and posting to the backend API.

**Details:**
1.  **Create an API Client (`lib/apiClient.ts` or similar):**
    * Centralize `fetch` or `axios` calls.
    * Automatically include JWT token in headers for authenticated requests.
    * Handle base URL (`NEXT_PUBLIC_API_URL`).
    * Basic error handling and response parsing.
    ```typescript
    // Example apiClient.ts structure
    import { getToken } from './auth'; // Function to get token from localStorage

    const apiClient = {
      get: async (endpoint: string, params?: Record<string, string>) => { /* ... */ },
      post: async (endpoint:string, data: any) => { /* ... */ },
      put: async (endpoint:string, data: any) => { /* ... */ },
      delete: async (endpoint: string) => { /* ... */ },
      // Add methods for file uploads if needed
    };
    export default apiClient;
    ```
2.  **Replace direct `fetch` calls with `apiClient` methods throughout the application.**
3.  **Thoroughly test all data interactions:** login, registration, profile updates, CV/product uploads, searches.

**Agent Checkpoint:** Centralized API client implemented. All frontend interactions use this client. Data flow tested.

### Step 2.9: Frontend Form Validation and User Feedback
**Agent Task:** Implement client-side form validation and provide clear user feedback for actions.

**Details:**
1.  **Client-Side Validation:**
    * Use a library like `react-hook-form` with `zod` (or `yup`) for schema-based validation.
    * `npm install react-hook-form zod @hookform/resolvers`
    * Provide real-time validation feedback on input fields.
2.  **User Feedback:**
    * Use a toast notification library (e.g., `react-toastify` or `sonner`) for success/error messages after API calls.
    * `npm install react-toastify`
    * Show loading states (spinners, disabled buttons) during API requests.
3.  **Accessibility:** Ensure forms are accessible (proper labels, ARIA attributes).

**Agent Checkpoint:** Client-side form validation implemented. Toast notifications and loading states added for better UX.

---

## Phase 3: Advanced Features & Refinements

### Step 3.1: Payment Gateway Integration (Stripe/Local Provider)
**Agent Task:** Integrate a payment gateway for pharmacy owner subscriptions.

**Details:**
1.  **Choose Provider:** Stripe (international) or a local Egyptian provider (e.g., Paymob, Fawry). Agent should state the chosen provider and note that local providers might require different SDKs/APIs. Assume Stripe for this example.
2.  **Backend (Stripe):**
    * Install Stripe Node.js library: `npm install stripe`
    * Create backend endpoints for:
        * Creating Stripe Checkout Sessions or Payment Intents (`POST /api/payments/create-checkout-session`).
        * Handling Stripe webhooks to confirm successful payments and update user subscription status (`POST /api/payments/webhook`). This is crucial for reliability.
3.  **Frontend (Stripe):**
    * Install Stripe.js: `npm install @stripe/stripe-js`
    * On the subscription page, when a user chooses a plan, call the backend to create a checkout session.
    * Redirect the user to Stripe Checkout using `redirectToCheckout` from `@stripe/stripe-js`.
    * Handle success and cancellation URLs.
4.  **Update Subscription Logic:** Modify `PharmacyOwnerProfile.subscriptionStatus` and `subscriptionExpiresAt` based on successful payment webhooks.

**Agent Checkpoint:** Payment gateway (Stripe or placeholder for local) integrated for subscriptions. Webhook handling implemented on backend.

### Step 3.2: Email Notification System
**Agent Task:** Implement email notifications for key events.

**Details:**
1.  **Choose Email Service:** SendGrid, Mailgun, AWS SES. Requires account setup and API keys.
2.  **Backend Integration:**
    * Install the chosen service's Node.js SDK (e.g., `@sendgrid/mail`).
    * Create an email service module (`backend/src/services/email.service.ts`).
    * Implement functions to send emails for:
        * User registration (welcome email).
        * Successful subscription.
        * Subscription expiry reminders.
        * (Optional) Notifications for new job matches or messages (if chat is added later).
3.  **Trigger Emails:** Call the email service functions from relevant parts of the backend logic (e.g., after successful registration, after payment webhook).

**Agent Checkpoint:** Email notification system integrated for key events.

### Step 3.3: Geocoding Service Integration (if addresses need conversion)
**Agent Task:** If address inputs are used for location search, integrate a geocoding service.

**Details:**
1.  **Service Choice:** Google Maps Geocoding API (requires API key, billing), Nominatim (OpenStreetMap, free but with usage policies).
2.  **Frontend Integration:**
    * When a pharmacy owner enters an address for their pharmacy or for searching, call the geocoding API to get latitude/longitude.
    * Store these coordinates.
3.  **Backend (Optional):** Geocoding could also happen on the backend if addresses are stored and need to be converted to coordinates periodically or on demand.
4.  **Display Maps (Optional Enhancement):** Use a library like Leaflet or React Map GL to display maps for location input or search results.

**Agent Checkpoint:** Geocoding service integrated if required by UI design for location input.

### Step 3.4: Admin Panel (Optional - for platform management)
**Agent Task:** (If requested/time permits) Develop a basic admin panel for platform management.

**Details:**
1.  **Scope:** User management (view users, change roles, manage subscriptions manually), content moderation (if applicable).
2.  **Implementation:** Could be a separate section of the Next.js app with admin-only routes, or a dedicated internal tool/framework (e.g., Retool, or a simple Express app with EJS/Pug templates).
3.  **Authentication:** Secure admin access stringently.

**Agent Checkpoint:** Basic admin panel functionalities outlined or implemented if in scope.

---

## Phase 4: Testing, Deployment & Documentation

### Step 4.1: Unit & Integration Testing (Backend & Frontend)
**Agent Task:** Write unit and integration tests.

**Details:**
1.  **Backend Testing:**
    * Framework: Jest, Mocha, or Vitest.
    * Use `supertest` for API endpoint testing.
    * Mock Prisma client for unit testing services.
    * Test authentication, business logic, PostGIS queries (mocked or against a test DB).
2.  **Frontend Testing:**
    * Framework: Jest with React Testing Library.
    * Test components, hooks, utility functions.
    * Mock API calls.

**Agent Checkpoint:** Test suites set up. Key functionalities covered by unit and integration tests.

### Step 4.2: End-to-End Testing
**Agent Task:** Set up and write end-to-end tests for critical user flows.

**Details:**
1.  **Framework:** Cypress or Playwright.
2.  **Test Scenarios:**
    * User registration (both roles).
    * Login and logout.
    * Pharmacist profile update and CV upload.
    * Pharmacy owner searches for candidates.
    * Pharmacy owner lists a product.
    * Subscription flow (mocking payment).

**Agent Checkpoint:** E2E testing framework set up. Critical user flows covered.

### Step 4.3: Backend Deployment Strategy & Execution
**Agent Task:** Prepare and deploy the backend application.

**Details:**
1.  **Platform Choice:** AWS Elastic Beanstalk, Heroku, DigitalOcean App Platform, Docker on a VPS.
2.  **Dockerfile (if using Docker):** Create a `Dockerfile` for the backend.
3.  **Build Process:** Ensure TypeScript is compiled to JavaScript (`npm run build` in `backend`).
4.  **Environment Variables:** Configure production environment variables on the deployment platform.
5.  **Database:** Ensure the production PostgreSQL database (with PostGIS) is accessible.
6.  **PM2 or similar process manager for Node.js application.**

**Agent Checkpoint:** Backend deployment strategy defined. Application deployed to a staging/production environment.

### Step 4.4: Frontend Deployment Strategy & Execution (Vercel)
**Agent Task:** Prepare and deploy the Next.js frontend.

**Details:**
1.  **Platform:** Vercel (highly recommended for Next.js).
2.  **Connect Git Repository:** Link the Vercel project to the GitHub/GitLab repository.
3.  **Build Settings:** Configure build command (`next build`) and output directory.
4.  **Environment Variables:** Configure `NEXT_PUBLIC_API_URL` and other production environment variables in Vercel.
5.  **Deployment:** Trigger deployment (usually automatic on git push).

**Agent Checkpoint:** Frontend deployed to Vercel or chosen platform.

### Step 4.5: Database Deployment & Configuration (Managed Service with PostGIS)
**Agent Task:** Ensure the production database is set up and configured.

**Details:**
1.  **Platform:** Amazon RDS for PostgreSQL, Google Cloud SQL, Supabase, ElephantSQL, Aiven.
2.  **PostGIS:** Ensure the chosen managed service supports and has the PostGIS extension enabled.
3.  **Security:** Configure network security (firewalls, VPCs) to allow access only from your backend application servers.
4.  **Backups:** Configure regular automated backups.
5.  **Connection String:** Update `DATABASE_URL` in the backend production environment.

**Agent Checkpoint:** Production database deployed, configured with PostGIS, and secured.

### Step 4.6: API Documentation (Swagger/OpenAPI)
**Agent Task:** Generate API documentation.

**Details:**
1.  **Tool:** Swagger (OpenAPI). Libraries like `swagger-jsdoc` and `swagger-ui-express` can be used with Express.
2.  **Annotate Routes:** Add OpenAPI annotations to backend route definitions.
3.  **Serve Documentation:** Expose a `/api-docs` endpoint using `swagger-ui-express`.

**Agent Checkpoint:** API documentation generated and accessible.

### Step 4.7: Final Code Review & Optimization
**Agent Task:** Perform a final review of the codebase for quality, performance, and security.

**Details:**
1.  **Code Quality:** Check for consistency, readability, and adherence to best practices.
2.  **Performance:**
    * Optimize database queries (check for N+1 issues, add indexes where necessary beyond Prisma defaults).
    * Frontend bundle size analysis (Next.js tools).
    * Image optimization.
3.  **Security:** Double-check for common vulnerabilities (OWASP Top 10). Ensure proper error handling for sensitive data.
4.  **Dependencies:** Update dependencies to latest stable versions if appropriate. Remove unused dependencies.

**Agent Checkpoint:** Final code review completed. Optimizations applied.

---

This detailed plan should guide the AI agent through the development of Pharma-Link Egypt. Each step builds upon the previous one, with checkpoints to ensure the agent is on track.
