# How to Use JWT Token in API Requests (Frontend Guide)

To access protected endpoints, the frontend must include the JWT token in the `Authorization` header of every API request:

```http
Authorization: Bearer <token>
```

**Example using fetch:**
```js
fetch('/api/protected-endpoint', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
});
```

- Replace `<token>` with the JWT received from the login endpoint.
- The token should be sent with every request to protected routes.
- If the token is missing or invalid, the backend will return a 401 Unauthorized error.

**Best Practices:**
- Store the JWT securely (e.g., in an HTTP-only cookie or secure storage).
- Always check for token expiration and handle re-authentication as needed.
- Never expose the JWT in URLs or client-side logs.

---

# API Documentation: Authentication & User Management

## Authentication Endpoints

### POST /api/auth/login
- **Description:** User login, returns JWT token and user info
- **Request Body:**
  - `email` (string, required)
  - `password` (string, required)
- **Response:**
  - `token` (string)
  - `user` (object)

#### Example
```json
POST /api/auth/login
{
  "email": "admin@dishub.jogjaprov.go.id",
  "password": "admin123"
}
```

---

### GET /api/auth/me
- **Description:** Get current user info (requires JWT)
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  - `user` (object)

---

### PUT /api/auth/profile
- **Description:** Update user profile (name, email, password)
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:**
  - `name` (string, optional)
  - `email` (string, optional)
  - `currentPassword` (string, required if changing password)
  - `newPassword` (string, optional)
- **Response:**
  - `user` (object)

---

### POST /api/auth/logout
- **Description:** Logout (client-side only, just remove token)
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  - `message` (string)

---

## User Management Endpoints (Admin Only)

### GET /api/users
- **Description:** List all users
- **Headers:**
  - `Authorization: Bearer <admin token>`
- **Response:**
  - `users` (array)

---

### POST /api/users
- **Description:** Create new user
- **Headers:**
  - `Authorization: Bearer <admin token>`
- **Request Body:**
  - `name` (string, required)
  - `email` (string, required)
  - `password` (string, required)
  - `status` (string, optional, default: "active")
  - `role_id` (int, optional)
- **Response:**
  - `user` (object)

---

### GET /api/users/:id
- **Description:** Get user by ID (admin or self)
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  - `user` (object)

---

### PUT /api/users/:id
- **Description:** Update user (admin or self)
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:**
  - `name` (string, optional)
  - `email` (string, optional)
  - `status` (string, optional)
- **Response:**
  - `user` (object)

---

### DELETE /api/users/:id
- **Description:** Delete user (admin only, cannot delete self)
- **Headers:**
  - `Authorization: Bearer <admin token>`
- **Response:**
  - `message` (string)

---

### POST /api/users/:id/role
- **Description:** Assign role to user (admin only)
- **Headers:**
  - `Authorization: Bearer <admin token>`
- **Request Body:**
  - `role_id` (int, required)
- **Response:**
  - `message` (string)

---

### DELETE /api/users/:id/role/:role_id
- **Description:** Remove role from user (admin only)
- **Headers:**
  - `Authorization: Bearer <admin token>`
- **Response:**
  - `message` (string)

---

## Error Responses
- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: Insufficient permissions
- 400 Validation Error: Invalid input
- 404 Not Found: Resource not found
- 500 Internal Server Error: Unexpected error 