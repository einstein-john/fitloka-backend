# Fin Tracker Backend API Structure

## Overview

This document describes the structure and endpoints of the Fin Tracker backend API. The backend is built with Node.js, Express, TypeScript, and Sequelize ORM, connecting to a PostgreSQL database (Neon Tech).

## Architecture

The backend follows a layered architecture pattern:

```
Routes → Controllers → Services → Models → Database
   ↓         ↓           ↓         ↓
Schemas (Validation)
```

### Directory Structure

```
src/
├── config/           # Server configuration and environment variables
├── controllers/      # Request handlers (business logic orchestration)
├── database/         # Database connection and models
│   └── models/      # Sequelize models (User, Category, Currency, Transaction, Application)
├── errors/          # Custom error classes
├── middlewares/     # Express middlewares (auth, validation, error handling)
├── routes/          # API route definitions
├── schemas/         # Joi validation schemas
├── services/        # Business logic layer
├── types/           # TypeScript interfaces and types
└── utils/           # Utility functions
```

## API Endpoints

All endpoints require API key authentication via the `X-API-KEY` header (except where noted).

### Base URL
```
http://localhost:3000 (default)
```

## Authentication

The API uses a two-layer authentication system:

### 1. API Key Authentication (Required for all endpoints)

All endpoints require API key authentication. Include the API key in the request header:
```
X-API-KEY: your-api-key-here
```

### 2. JWT Token Authentication (Required for user-specific endpoints)

User-specific endpoints (Users, Categories, Transactions) require both API key AND JWT token authentication.

After logging in, include the JWT token in the request header:
```
Authorization: Bearer <jwt-token>
```

The JWT token contains the user ID, which is automatically extracted by the backend. **You do not need to send `userId` in requests** - it's automatically determined from the token.

---

## Authentication Endpoints

### Login
- **POST** `/auth/login`
- **Description**: Login with username and email to get JWT token. **Automatically creates a new user if they don't exist** (passwordless authentication).
- **Auth**: API Key only
- **Request Body**:
  ```json
  {
    "username": "string (required)",
    "email": "string (valid email, required)"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "data": {
      "token": "jwt-token-string",
      "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com"
      }
    }
  }
  ```
- **Behavior**:
  - If user exists with matching username and email: Login and return token
  - If user doesn't exist: Automatically create new user with provided username/email, then login
  - New users are created with:
    - `enabled: true`
    - `isAdmin: false`
    - All other fields set to `null` (can be updated later)
- **Error Cases**:
  - **409 Conflict**: If username exists with different email, or email exists with different username
  - **401 Unauthorized**: If user account is disabled

### Login with Magic Link (Future)
- **GET** `/auth/login/magic-link?token=<token>`
- **Description**: Login using a magic link token (for email-based authentication)
- **Auth**: API Key only
- **Query Parameters**: `token` (string) - Magic link token from email
- **Response**: Same as login endpoint

---

## User Endpoints

All user endpoints require **both API Key and JWT Token** authentication.

### Create User
- **POST** `/users`
- **Description**: Create a new user (registration)
- **Auth**: API Key only (no JWT needed for registration)
- **Request Body**:
  ```json
  {
    "username": "string (required)",
    "email": "string (valid email, required)",
    "firstName": "string (optional, can be null)",
    "lastName": "string (optional, can be null)",
    "password": "string (optional, can be null)",
    "enabled": "boolean (optional, default: true)",
    "isAdmin": "boolean (optional, default: false)",
    "defaultCurrencyId": "number (optional, can be null)",
    "profilePicture": "string (URI, optional, can be null)",
    "lastLogin": "date (optional, can be null)"
  }
  ```
- **Response**: Full user object

### Get Current User Profile
- **GET** `/users/me`
- **Description**: Get the authenticated user's profile
- **Auth**: API Key + JWT Token (required)
- **Response**: Full user object

### Get User by ID
- **GET** `/users/:id`
- **Description**: Retrieve a specific user by ID
- **Auth**: API Key + JWT Token (required)
- **Parameters**: `id` (number)
- **Access Control**: 
  - Regular users: Can only access their own profile
  - Admin users: Can access any user profile
- **Response**: Full user object

### Update User
- **PUT** `/users/:id`
- **Description**: Update user information
- **Auth**: API Key + JWT Token (required)
- **Parameters**: `id` (number)
- **Access Control**: 
  - Regular users: Can only update their own profile
  - Admin users: Can update any user profile
- **Request Body**: Same as create, but all fields optional

### Delete User
- **DELETE** `/users/:id`
- **Description**: Soft delete a user (paranoid deletion)
- **Auth**: API Key + JWT Token (required)
- **Parameters**: `id` (number)
- **Access Control**: 
  - Regular users: Can only delete their own account
  - Admin users: Can delete any user account

---

## Category Endpoints

All category endpoints require **both API Key and JWT Token** authentication.

### Create Category
- **POST** `/categories`
- **Description**: Create a new category for the authenticated user
- **Auth**: API Key + JWT Token (required)
- **Request Body**:
  ```json
  {
    "name": "string (1-100 chars, required)",
    "description": "string (1-500 chars, required)",
    "type": "string (INCOME | EXPENSE | SAVINGS | INVESTMENT | OTHER, required)"
  }
  ```
  **Note**: `userId` is automatically set from the JWT token - do not include it in the request.
- **Response**: Full category object

### Get All Categories
- **GET** `/categories`
- **Description**: Retrieve categories (supports pagination)
- **Auth**: API Key + JWT Token (required)
- **Access Control**: 
  - Regular users: See only their own categories
  - Admin users: See all categories
- **Query Parameters** (optional):
  - `page` (number, default: 1): Page number
  - `limit` (number, default: 10, max: 100): Items per page
- **Response** (without pagination):
  ```json
  {
    "message": "Categories fetched successfully",
    "data": [
      { "id": 1 },
      { "id": 2 }
    ]
  }
  ```
- **Response** (with pagination - when `page` and `limit` are provided):
  ```json
  {
    "message": "Categories fetched successfully",
    "data": [
      { "id": 1 },
      { "id": 2 }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
  ```

### Get Category by ID
- **GET** `/categories/:id`
- **Description**: Retrieve a specific category by ID
- **Auth**: API Key + JWT Token (required)
- **Parameters**: `id` (number)
- **Access Control**: 
  - Regular users: Can only access their own categories
  - Admin users: Can access any category
- **Response**: Full category object

### Update Category
- **PUT** `/categories/:id`
- **Description**: Update category information
- **Auth**: API Key + JWT Token (required)
- **Parameters**: `id` (number)
- **Access Control**: 
  - Regular users: Can only update their own categories
  - Admin users: Can update any category
- **Request Body**: All fields optional
  ```json
  {
    "name": "string (optional)",
    "description": "string (optional)",
    "type": "string (optional)"
  }
  ```

### Delete Category
- **DELETE** `/categories/:id`
- **Description**: Soft delete a category
- **Auth**: API Key + JWT Token (required)
- **Parameters**: `id` (number)
- **Access Control**: 
  - Regular users: Can only delete their own categories
  - Admin users: Can delete any category

---

## Statistics Endpoints

All statistics endpoints require **both API Key and JWT Token** authentication.

### Get Summary Statistics
- **GET** `/stats/summary`
- **Description**: Get summary statistics (total balance, income, expense) for the authenticated user
- **Auth**: API Key + JWT Token (required)
- **Query Parameters** (optional):
  - `startDate` (ISO date string): Filter transactions from this date onwards
  - `endDate` (ISO date string): Filter transactions up to this date (must not be greater than today)
- **Response**:
  ```json
  {
    "message": "Summary statistics fetched successfully",
    "data": {
      "totalBalance": 1500.50,
      "totalIncome": 3000.00,
      "totalExpense": 1499.50
    }
  }
  ```
- **Notes**:
  - `totalBalance = totalIncome - totalExpense`
  - Only counts transactions with category type `INCOME` for income total
  - Only counts transactions with category type `EXPENSE` for expense total
  - If no date range is provided, calculates stats for all user transactions
  - `endDate` is automatically capped at today if a future date is provided

### Get Statistics by Category
- **GET** `/stats/by-category`
- **Description**: Get statistics grouped by category for the authenticated user
- **Auth**: API Key + JWT Token (required)
- **Query Parameters** (optional):
  - `startDate` (ISO date string): Filter transactions from this date onwards
  - `endDate` (ISO date string): Filter transactions up to this date (must not be greater than today)
- **Response**:
  ```json
  {
    "message": "Category statistics fetched successfully",
    "data": [
      {
        "categoryId": 1,
        "categoryName": "Groceries",
        "categoryType": "EXPENSE",
        "totalAmount": 500.00,
        "transactionCount": 15
      },
      {
        "categoryId": 2,
        "categoryName": "Salary",
        "categoryType": "INCOME",
        "totalAmount": 3000.00,
        "transactionCount": 1
      }
    ]
  }
  ```
- **Notes**:
  - Returns statistics for each category the user has transactions in
  - `totalAmount` is the sum of all transaction amounts for that category
  - `transactionCount` is the number of transactions in that category
  - If no date range is provided, calculates stats for all user transactions
  - `endDate` is automatically capped at today if a future date is provided

---

## Currency Endpoints

Currency endpoints require **API Key only** (no JWT needed).

### Create Currency
- **POST** `/currencies`
- **Description**: Create a new currency
- **Auth**: API Key only
- **Request Body**:
  ```json
  {
    "name": "string (1-100 chars, required)",
    "code": "string (exactly 3 uppercase characters, e.g., 'USD', required)"
  }
  ```
- **Response**: Full currency object

### Get All Currencies
- **GET** `/currencies`
- **Description**: Retrieve all currencies (returns full objects for code-to-ID mapping)
- **Auth**: API Key only
- **Response**: Array of full currency objects
  ```json
  {
    "message": "Currencies fetched successfully",
    "data": [
      {
        "id": 1,
        "name": "US Dollar",
        "code": "USD",
        "createdAt": "...",
        "updatedAt": "..."
      },
      {
        "id": 2,
        "name": "Indonesian Rupiah",
        "code": "IDR",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
  ```

### Get Currency by Code
- **GET** `/currencies/code/:code`
- **Description**: Retrieve a specific currency by its code (e.g., 'USD', 'IDR')
- **Auth**: API Key only
- **Parameters**: `code` (string) - 3-letter uppercase currency code
- **Response**: Full currency object
  ```json
  {
    "message": "Currency fetched successfully",
    "data": {
      "id": 1,
      "name": "US Dollar",
      "code": "USD",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
  ```
- **Use Case**: Frontend can use this to map currency codes (strings) to currency IDs (numbers) for the `defaultCurrencyId` field

### Get Currency by ID
- **GET** `/currencies/:id`
- **Description**: Retrieve a specific currency by ID
- **Auth**: API Key only
- **Parameters**: `id` (number)
- **Response**: Full currency object

### Update Currency
- **PUT** `/currencies/:id`
- **Description**: Update currency information
- **Auth**: API Key only
- **Parameters**: `id` (number)
- **Request Body**: All fields optional

### Delete Currency
- **DELETE** `/currencies/:id`
- **Description**: Soft delete a currency
- **Auth**: API Key only
- **Parameters**: `id` (number)

---

## Transaction Endpoints

All transaction endpoints require **both API Key and JWT Token** authentication.

### Create Transaction
- **POST** `/transactions`
- **Description**: Create a new transaction for the authenticated user
- **Auth**: API Key + JWT Token (required)
- **Request Body**:
  ```json
  {
    "categoryId": "number (positive integer, required)",
    "amount": "number (decimal with 2 precision, required)",
    "date": "date (ISO 8601 format, required)",
    "description": "string (1-500 chars, required)"
  }
  ```
  **Note**: `userId` is automatically set from the JWT token - do not include it in the request.
- **Response**: Full transaction object

### Get All Transactions
- **GET** `/transactions`
- **Description**: Retrieve transactions (supports pagination)
- **Auth**: API Key + JWT Token (required)
- **Query Parameters** (optional):
  - `page` (number, default: 1): Page number
  - `limit` (number, default: 10, max: 100): Items per page
  - `categoryId` (number): Filter transactions by category ID (for the authenticated user)
- **Access Control**: 
  - Regular users: See only their own transactions (optionally filtered by categoryId)
  - Admin users: See all transactions (optionally filtered by categoryId across all users)
- **Response** (without pagination):
  ```json
  {
    "message": "Transactions fetched successfully",
    "data": [
      { "id": 1 },
      { "id": 2 }
    ]
  }
  ```
- **Response** (with pagination - when `page` and `limit` are provided):
  ```json
  {
    "message": "Transactions fetched successfully",
    "data": [
      { "id": 1 },
      { "id": 2 }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
  ```
- **Note**: Transactions are ordered by date (newest first), then by creation date. Pagination is **highly recommended** for this endpoint as users can have hundreds or thousands of transactions.

### Get Transaction by ID
- **GET** `/transactions/:id`
- **Description**: Retrieve a specific transaction by ID
- **Auth**: API Key + JWT Token (required)
- **Parameters**: `id` (number)
- **Access Control**: 
  - Regular users: Can only access their own transactions
  - Admin users: Can access any transaction
- **Response**: Full transaction object

### Update Transaction
- **PUT** `/transactions/:id`
- **Description**: Update transaction information
- **Auth**: API Key + JWT Token (required)
- **Parameters**: `id` (number)
- **Access Control**: 
  - Regular users: Can only update their own transactions
  - Admin users: Can update any transaction
- **Request Body**: All fields optional
  ```json
  {
    "categoryId": "number (optional)",
    "amount": "number (optional)",
    "date": "date (optional)",
    "description": "string (optional)"
  }
  ```

### Delete Transaction
- **DELETE** `/transactions/:id`
- **Description**: Soft delete a transaction
- **Auth**: API Key + JWT Token (required)
- **Parameters**: `id` (number)
- **Access Control**: 
  - Regular users: Can only delete their own transactions
  - Admin users: Can delete any transaction

---

## Application Endpoints

Application endpoints require **API Key only** (no JWT needed).

### Create Application
- **POST** `/applications`
- **Description**: Create a new application (generates API key)
- **Auth**: API Key only
- **Request Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Response**: Application object with generated API key

### Get All Applications
- **GET** `/applications`
- **Description**: Retrieve all active applications
- **Auth**: API Key only
- **Response**: Array of application objects

### Get Application by ID
- **GET** `/applications/:id`
- **Description**: Retrieve a specific application by ID
- **Auth**: API Key only
- **Parameters**: `id` (number)

### Update Application
- **PUT** `/applications/:id`
- **Description**: Update application information
- **Auth**: API Key only
- **Parameters**: `id` (number)

### Delete Application
- **DELETE** `/applications/:id`
- **Description**: Soft delete an application
- **Auth**: API Key only
- **Parameters**: `id` (number)

---

## Admin User Functionality

Users with `isAdmin: true` have elevated privileges:

### Admin Access Rights:
- **View All Data**: Admins can view all users, categories, and transactions (not just their own)
- **Manage All Resources**: Admins can create, update, and delete any user's categories and transactions
- **User Management**: Admins can view, update, and delete any user account
- **Full System Access**: Admins bypass all ownership checks

### Admin Restrictions:
- Admins still need valid JWT tokens for authentication
- Admins must still provide API keys
- Admin status is checked server-side (cannot be faked)

### Creating Admin Users:
Set `isAdmin: true` when creating or updating a user:
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "isAdmin": true
}
```

---

## Database Models

### User
- `id`: Primary key (auto-increment)
- `username`: Unique username (required)
- `firstName`: User's first name (nullable)
- `lastName`: User's last name (nullable)
- `email`: Unique email address (required)
- `password`: Hashed password (nullable)
- `enabled`: Account status (default: true)
- `isAdmin`: Admin flag (default: false)
- `defaultCurrencyId`: Foreign key to Currency (nullable)
- `profilePicture`: URL to profile picture (nullable)
- `lastLogin`: Last login timestamp (nullable)
- `createdAt`, `updatedAt`, `deletedAt`: Timestamps (paranoid)

### Category
- `id`: Primary key (auto-increment)
- `userId`: Foreign key to User (set automatically from JWT)
- `name`: Category name (required)
- `description`: Category description (required)
- `type`: Enum (INCOME, EXPENSE, SAVINGS, INVESTMENT, OTHER)
- `createdAt`, `updatedAt`, `deletedAt`: Timestamps (paranoid)

### Currency
- `id`: Primary key (auto-increment)
- `name`: Currency name (e.g., "US Dollar")
- `code`: Currency code (e.g., "USD")
- `createdAt`, `updatedAt`, `deletedAt`: Timestamps (paranoid)

### Transaction
- `id`: Primary key (auto-increment)
- `userId`: Foreign key to User (set automatically from JWT)
- `categoryId`: Foreign key to Category (required)
- `amount`: Decimal (10,2) (required)
- `date`: Transaction date (required)
- `description`: Transaction description (required)
- `createdAt`, `updatedAt`, `deletedAt`: Timestamps (paranoid)

### Application
- `id`: Primary key (auto-increment)
- `name`: Application name
- `apiKey`: Unique API key (32 characters)
- `isActive`: Active status
- `createdAt`, `updatedAt`, `deletedAt`: Timestamps (paranoid)

---

## Validation

All endpoints use Joi schemas for request validation:

- **Create endpoints**: Validate required fields with strict rules
- **Update endpoints**: Validate only provided fields (all optional, accepts null/empty strings)
- **Parameter validation**: Validates route parameters (IDs must be positive integers)

Validation errors return a 400 status with detailed error messages:
```json
{
  "message": "Validation error.",
  "data": {
    "error": [
      {
        "field": "email",
        "message": "\"email\" must be a valid email"
      }
    ]
  }
}
```

---

## Error Handling

The API uses a centralized error handling middleware that:
- Catches all errors and formats them consistently
- Returns appropriate HTTP status codes
- Provides detailed error messages in development
- Logs errors for debugging

### Common Error Responses

**404 Not Found**:
```json
{
  "message": "This [resource] could not be found."
}
```

**400 Bad Request** (Validation):
```json
{
  "message": "Validation error.",
  "data": {
    "error": [
      {
        "field": "email",
        "message": "\"email\" must be a valid email"
      }
    ]
  }
}
```

**401 Unauthorized** (Invalid API Key or Token):
```json
{
  "message": "Invalid API key."
}
```
or
```json
{
  "message": "Authorization token is required"
}
```

**403 Forbidden** (Access Denied):
```json
{
  "message": "Access denied"
}
```

---

## Response Format

All successful responses follow this format:
```json
{
  "message": "Success message",
  "data": { ... }  // or [ ... ] for arrays
}
```

### List Endpoints Response Format

List endpoints (GET all) return only ID objects for privacy:
```json
{
  "message": "[Resource] fetched successfully",
  "data": [
    { "id": 1 },
    { "id": 2 },
    { "id": 3 }
  ]
}
```

**Exception**: `GET /users/:id` returns full user object for accessing specific user details.

---

## Middlewares

1. **API Key Authentication**: Validates `X-API-KEY` header (required for all endpoints)
2. **JWT Authentication**: Validates `Authorization: Bearer <token>` header (required for user-specific endpoints)
3. **Validation Middleware**: Validates request body, params, and query using Joi schemas
4. **Error Handler**: Centralized error handling
5. **Request Logger**: Logs all incoming requests
6. **Bot Protection**: Security headers and suspicious activity logging
7. **CORS**: Configurable CORS settings

---

## Environment Variables

Required environment variables:
- `NODE_ENV`: Environment (development, production, etc.)
- `PORT`: Server port (default: 3000)
- `DB_HOST`: Database host
- `DB_PORT`: Database port (default: 3306, should be 5432 for PostgreSQL)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins
- `JWT_SECRET`: Secret key for JWT token signing (required)
- `JWT_EXPIRES_IN`: JWT token expiration time (default: "7d")

---

## Database Configuration

- **Database**: PostgreSQL (Neon Tech)
- **Port**: 5432 (default PostgreSQL port)
- **ORM**: Sequelize
- **Soft Deletes**: Enabled (paranoid mode) for all models

---

## Authentication Flow

1. **Get API Key**: Create an application via `POST /applications` to get an API key
2. **Register User**: Create a user via `POST /users` (no JWT needed)
3. **Login**: Authenticate via `POST /auth/login` with username and email
4. **Get JWT Token**: Response includes a JWT token
5. **Use Token**: Include token in `Authorization: Bearer <token>` header for user-specific endpoints

### Example Flow:
```bash
# 1. Create application (get API key)
POST /applications
Headers: X-API-KEY: <initial-api-key>
Body: { "name": "My App" }
Response: { "apiKey": "abc123..." }

# 2. Register user
POST /users
Headers: X-API-KEY: abc123...
Body: { "username": "johndoe", "email": "john@example.com" }

# 3. Login
POST /auth/login
Headers: X-API-KEY: abc123...
Body: { "username": "johndoe", "email": "john@example.com" }
Response: { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }

# 4. Use authenticated endpoints
GET /categories
Headers: 
  X-API-KEY: abc123...
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Security Features

### JWT Token Security
- Tokens are stateless (no database storage needed)
- Tokens expire after 7 days (configurable)
- Tokens contain user ID for automatic identification
- Old tokens are not tracked (rely on expiration)

### User Data Isolation
- Regular users can only access their own data
- User ID is extracted from JWT token (cannot be spoofed)
- Ownership verification on all operations
- Admin users can access all data

### API Security
- API key required for all endpoints
- JWT token required for user-specific endpoints
- CORS protection
- Bot protection middleware
- Helmet.js security headers

---

## Development Notes

- All models use soft deletes (paranoid mode)
- Timestamps are automatically managed by Sequelize
- API keys are 32-character UUID strings (without dashes)
- JWT tokens use HS256 algorithm
- Password validation allows null (for passwordless authentication)
- Currency codes must be exactly 3 uppercase characters
- Transaction amounts are stored as DECIMAL(10,2)
- User fields (except username/email) are optional and accept null/empty strings
- List endpoints return only IDs for privacy
- Admin users bypass all ownership checks

---

## API Response Interfaces

All responses use TypeScript interfaces for type safety:

- `ApiResponse<T>`: Generic API response
- `ApiValidationErrorResponse`: Validation error response
- `ApiErrorResponse`: General error response
- `LoginResponse`: Login success response
- `ApiPaginatedResponse<T>`: Paginated response (for future use)

---

## Next Steps

Consider implementing:
1. Password hashing (bcrypt) for password storage
2. Refresh tokens for extended sessions
3. Pagination for list endpoints
4. Database relationships/associations
5. Transaction filtering by date range
6. Reporting/analytics endpoints
7. Rate limiting per user
8. Email verification for users
9. Password reset functionality
10. Magic link email implementation
