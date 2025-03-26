# e-commerce API

E-commerce API implemented using Node.js, Express, and MongoDB utilizing most of e-commerce platform features like users, auth, products, brands, categories, subcategories, brands, shopping carts, and orders.

## Features

- **Authentication and Authorization**

  - User registration with email verification using verification code.
  - Authentication using JWT with refresh tokens.
  - Role-based authorization.
  - Ownership-based authorization.
  - Password management including forgot, reset, and update password operations.

- **Users**

  - User account management.
  - User wishlist management.
  - User addresses management.

- **Products**

  - Create, read, update, and delete products.
  - Filter products by category, subcategory, rating, price, colors, brand.
  - Search for products with certain keywords.
  - Sort, select fields, and paginate products results.

- **Categories and Subcategories**

  - Create, read, update, and delete product categories and subcategories.
  - Get subcategories for certain category

- **Reviews**

  - Allow users to post reviews for products.
  - Retrieve, filter, sort, and paginate product reviews.

- **Cart Management**

  - Add, remove, and update items in a shopping cart.
  - Calculate cart totals.
  - Apply coupons to carts.
  - Clear carts.

- **Coupons**

  - Create, read, update, and delete coupons

- **Orders**
  - Create cash order.
  - Update order status.
  - Create card order through stripe.
  - Retrieve users orders.

## Technologies Used

- **Node.js**
- **Express**
- **MongoDB with Mongoose**
- **JWT** for auth
- **Stripe** for payment
- **Nodemailer** for email services
- **Multer** for file uploads
- **Sharp** for image processing
- **express-validator** for validation layer
- **Jest** for unit-testing
- **cors**, **express-rate-limit**, **helmet**, **xss**, **express-mongo-sanitize**, **hpp**, **compression** for security and performance.

## Getting Started

1. **Clone the repository**

   ```sh
   git clone https://github.com/Bemin12/e-commerce.git
   cd e-commerce
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Set up environment variables**

- Create a `config.env` file in the root directory
- Add the following variables

  ```env
  PORT=8000
  NODE_ENV=development

  # Database
  DB_PASSWORD=<your-database-password>
  DB_USER=your-database-username
  DB_URI=mongodb://localhost:27017/e-commerce -or- <your-atlas-connection-string>

  # JWT
  ACCESS_TOKEN_SECRET=<your-access-token-secret>
  ACCESS_TOKEN_EXPIRES_IN=15m
  REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
  REFRESH_TOKEN_EXPIRES_IN=7d
  REFRESH_TOKEN_COOKIE_EXPIRES_IN=7

  # Email settings
  # In Development
  EMAIL_HOST=<your-mailtrap-host>
  EMAIL_PORT=587
  EMAIL_USERNAME=<your-mailtrap-username>
  EMAIL_PASSWORD=<your-mailtrap-password>

  # In production
  SENDGRID_USERNAME=<your-sendgrid-username>
  SENDGRID_PASSWORD=<your-sendgrid-password>

  EMAIL_FROM=<your-email> -must match sendgrid email in case of using sendgrid-

  # Stripe Settings
  STRIPE_API_SECRET=<your-stripe-api-secret>
  STRIPE_WEBHOOK_SECRET= <your-stripe-webhook-secret>
  ```

4. **Start the server**

   ```sh
   npm run dev
   ```
