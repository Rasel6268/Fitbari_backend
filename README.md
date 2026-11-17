# Fit Bari Backend API

A clean, modular, production-ready RESTful API backend for the **Fit Bari** premium health & fitness nutrition e-commerce platform.

---

## Architectural Philosophy
> **Important Note:** In Fit Bari, **customers never need to register to shop or browse products.** 
> Shoppers can discover harvests, filter categories, search items, and proceed with guest checkout without creating an account. The authentication system is designed for store management, staff administration, and optional customer profiles.

---

## Directory Structure

```text
fitbari_backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB Mongoose connection handler
│   │   ├── cors.js              # Whitelisted origin & headers configuration
│   │   ├── env.js               # Centralized environment variable loader
│   │   └── imagekit.js          # ImageKit media storage SDK configuration
│   │
│   ├── modules/
│   │   ├── auth/                # Authentication module
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.validation.js
│   │   │   └── auth.model.js
│   │   │
│   │   ├── user/                # User management & profile module
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.routes.js
│   │   │   ├── user.validation.js
│   │   │   └── user.model.js
│   │   │
│   │   └── product/             # Product catalog & inventory module
│   │       ├── product.controller.js
│   │       ├── product.service.js
│   │       ├── product.routes.js
│   │       ├── product.validation.js
│   │       └── product.model.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Mandatory & optional JWT authentication
│   │   ├── role.middleware.js   # Role-Based Access Control (RBAC) guard
│   │   ├── error.middleware.js  # Global centralized error handler
│   │   ├── notFound.middleware.js # 404 unmapped route handler
│   │   └── validate.middleware.js # Zod request payload validation
│   │
│   ├── utils/
│   │   ├── ApiError.js          # Operational custom error subclass
│   │   ├── ApiResponse.js       # Standardized JSON response envelope
│   │   ├── catchAsync.js        # Async route wrapper removing try/catch boilerplate
│   │   ├── generateToken.js     # JWT token signing and verification
│   │   └── sendEmail.js         # Nodemailer SMTP transporter
│   │
│   ├── helpers/
│   │   ├── pagination.js        # Query pagination, sorting & skip calculations
│   │   ├── password.js          # Bcrypt hashing & verification utilities
│   │   └── upload.js            # Multer file storage & mime type filters
│   │
│   ├── constants/
│   │   ├── roles.js             # User & staff roles definition
│   │   └── status.js            # Product & order status enum constants
│   │
│   ├── routes/
│   │   └── index.js             # Master API router mounting all modules
│   │
│   ├── app.js                   # Express application initialization & middleware
│   └── server.js                # Server entry point & graceful shutdown
│
├── uploads/                     # Local file upload directory
├── logs/                        # Application logs storage
├── tests/                       # Automated test suites
│
├── .env                         # Local environment variables
├── .env.example                 # Example environment template
├── .gitignore                   # Git ignore specifications
├── package.json                 # Project dependencies & scripts
└── README.md                    # Project documentation
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster URI

### 2. Installation
```bash
cd fitbari_backend
npm install
```

### 3. Environment Setup
Configure your `.env` file (copied from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fitbari
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### 4. Running the Server
```bash
# Development mode with hot-reloading (nodemon)
npm run dev

# Production mode
npm start
```

---

## Key API Endpoints

### Health Check
- `GET /api/v1/health` - Check API operational status and server uptime

### Authentication (Administrative Staff Only)
> **Note:** Fit Bari customers **never need to authenticate or create an account to shop**. Authentication is strictly reserved for administrative management and staff governance.

- `POST /api/v1/auth/admin/register` - Register a new administrator / staff member (automatically promotes first account to `SUPER_ADMIN`)
- `POST /api/v1/auth/admin/login` - Administrator login with role verification (`SUPER_ADMIN`, `ADMIN`, `MANAGER`)
- `GET /api/v1/auth/me` - *(Protected)* Get current session administrator profile
- `POST /api/v1/auth/logout` - Logout and terminate session
- `POST /api/v1/auth/change-password` - *(Protected)* Change administrator password
- `POST /api/v1/auth/forgot-password` - Dispatch password recovery token via email
- `POST /api/v1/auth/reset-password` - Complete password reset using token

### Orders (Guest Checkout & Tracking)
- `POST /api/v1/orders` - **(Public/Guest)** Place a new order without registration
- `GET /api/v1/orders/track/:orderNumber` - **(Public)** Track order status by Order Number & Phone
- `GET /api/v1/orders/:id` - Fetch order details by ID
- `GET /api/v1/orders/admin/all` - *(Admin)* Paginated list of all orders with filters
- `PATCH /api/v1/orders/:id/status` - *(Admin)* Update order status (PENDING, CONFIRMED, SHIPPED, DELIVERED)
- `PATCH /api/v1/orders/:id/payment` - *(Admin)* Update payment status (PENDING, PAID, REFUNDED)

### Products (Public - No registration needed)
- `GET /api/v1/products` - Browse paginated products (filters: `category`, `search`, `minPrice`, `maxPrice`, `isBestSeller`)
- `GET /api/v1/products/:identifier` - Get product by `slug` or `_id`
- `GET /api/v1/products/related` - Get related products in the same category
- `POST /api/v1/products` - *(Admin)* Create a new product
- `PATCH /api/v1/products/:id` - *(Admin)* Update product details
- `DELETE /api/v1/products/:id` - *(Admin)* Archive or delete product

### Authentication (Admin / Staff / Optional Shopper Account)
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Authenticate and receive JWT Bearer token
- `POST /api/v1/auth/forgot-password` - Request password reset code
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/change-password` - *(Auth)* Change current password

### Users (Protected)
- `GET /api/v1/users/me` - Get authenticated profile
- `PATCH /api/v1/users/me` - Update profile information
- `GET /api/v1/users` - *(Admin)* List all registered users
- `PATCH /api/v1/users/:id/role` - *(Super Admin)* Update user role
- `PATCH /api/v1/users/:id/status` - *(Admin)* Toggle account activation

