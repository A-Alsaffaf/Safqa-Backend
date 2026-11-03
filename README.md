# Safqa-Backend

# Safqa Backend API

## Overview

This repository contains the Node.js, Express and MongoDB backend for **Project Name**.

## Related Links

- **Backend API:** Deployed Backend URL
- **Frontend Application:** Deployed Frontend URL
- **Frontend Repository:** Frontend Github Repository URL

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens or session authentication
- bcrypt
- dotenv
- Morgan
- Jest
- Supertest


## Features

- User registration
- User login and logout
- Authentication middleware
- CRUD API endpoints
- Request validation
- MongoDB relationships
- Rate Limiting
- Clear Error Handling with proper status codes
- Search and filtering
- Automated API tests
- Role-based or ownership-based authorization
- Any other features you want to highlight


## Project Structure

```text
server/
├── .github/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── tests/
├── app.js
└── server.js
```

### Folder Responsibilities

| Folder        | Purpose                                         |
| ------------- | ----------------------------------------------- |
| `config`      | Database and application configuration          |
| `controllers` | HTTP request and response handling              |
| `middleware`  | Authentication, validation and error middleware |
| `models`      | Mongoose schemas and models                     |
| `routes`      | Express route definitions                       |
| `tests`       | Automated tests                                 |
| `app.js`      | Express application configuration               |
| `server.js`   | Database connection and server startup          |

## Getting Started

### Prerequisites

Install:

- node.js
- MongoDB locally or a MongoDB Atlas account

## Installation

### 1. Clone the repository

```bash
git clone BACKEND_REPOSITORY_URL
cd BACKEND_REPOSITORY_NAME
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Create `.env` in the root directory:

```env
PORT=3000
MONGODB_URI=your-connection-string
CLIENT_URL=http://localhost:5173
JWT_SECRET=unique-password-no-one-would-guess
```


### 4. Start the development server

```bash
npm run dev
```

The API should be available at:

```text
http://localhost:3000
```

## Database Models

### User

| Field       | Type   | Rules                       |
| ----------- | ------ | --------------------------- |
| `username`  | String | Required, unique, trimmed   |
| `email`     | String | Required, unique, lowercase |
| `password`  | String | Required, hashed            |
| `role`      | String | `user` or `admin`           |
| `createdAt` | Date   | Generated automatically     |
| `updatedAt` | Date   | Generated automatically     |

One table for each model


## Entity Relationships

![alt text](image.png)



## API Base URL

Local development:

```text
http://localhost:3000
```

Production:

```text
https://your-deployed-api.com
```

## Endpoints

### Dashboard

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | View Dashboard/Homepage |

### Auth

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/register` | View Register Page |
| POST | `/register` | Submit form to create User |
| GET | `/login` | View Login Page |
| POST | `/login` | Submit form to log in |
| POST | `/logout` | Log out current User |

### Users

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/users/:id` | View User Profile |
| GET | `/users/:id/edit` | View Edit User Page |
| PUT | `/users/:id` | Submit form to update User |

### Listings

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/listings` | View Listings Page (browse/search) |
| GET | `/listings/new` | View Create Listing Page |
| POST | `/listings` | Submit form to save Listing |
| GET | `/listings/:id` | View Listing Details |
| GET | `/listings/:id/edit` | View Edit Listing Page |
| PUT | `/listings/:id` | Submit form to update Listing |
| DELETE | `/listings/:id` | Submit form to set status: removed |
| POST | `/listings/:id/buy-now` | Buy a fixed-price Listing (creates Order) |

### Bids

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/listings/:id/bids` | View Bid History for an auction Listing |
| POST | `/listings/:id/bids` | Submit form to place a Bid |

### Orders

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/orders` | View User's Orders Page |
| GET | `/orders/:id` | View Order Details |
| PUT | `/orders/:id/status` | Submit form to update Order status (paid, shipped, completed) |

### Reports

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/listings/:id/reports` | Submit form to report a Listing |
| GET | `/admin/reports` | View Reports Page (filter by status) |
| GET | `/admin/reports/:id` | View Report Details |
| PUT | `/admin/reports/:id` | Submit form to update Report status (open, reviewed, dismissed) |

### Categories

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/categories` | View All Categories |
| GET | `/categories/:id` | View Listings in a Category |
| POST | `/admin/categories` | Submit form to save Category |
| PUT | `/admin/categories/:id` | Submit form to update Category |
| DELETE | `/admin/categories/:id` | Submit form to delete Category |

## Status Codes
Use these or any other status codes you implemented

| Status | Meaning in this API                |
| -----: | ---------------------------------- |
|  `200` | Successful request                 |
|  `201` | Resource created                   |
|  `204` | Successful deletion with no body   |
|  `400` | Invalid request                    |
|  `401` | Authentication required or invalid |
|  `403` | Authenticated but not permitted    |
|  `404` | Resource not found                 |
|  `409` | Resource conflict                  |
|  `429` | Too many requests                  |
|  `500` | Unexpected server error            |

## Testing

Run tests:

```bash
npm test
```

Tests should use a dedicated test database or an in-memory database.

## Future Enhancements


## Team Members

| Name           | GitHub           | Responsibilities       |
| ------------   | ---------------- | ---------------------- |
| Ahmed Alsaffaf | [GitHub profile] | N/A            |
| Sayed Ali      | [GitHub profile] | N/A            |
| Mohammed Ali   | [GitHub profile] | N/A            |


## Credits