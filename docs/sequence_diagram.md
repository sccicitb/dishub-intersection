# Sequence Diagram: Authentication Flow

## Login Flow Sequence
This diagram shows the detailed sequence of interactions during user login.

```mermaid
sequenceDiagram
    participant F as Frontend
    participant R as Route
    participant AC as Auth Controller
    participant UM as User Model
    participant DB as Database
    participant JWT as JWT Service

    F->>R: POST /api/auth/login
    Note over F,R: {email, password}
    
    R->>AC: login(email, password)
    
    AC->>UM: getUserByEmail(email)
    UM->>DB: SELECT with JOIN users, roles, user_roles
    DB-->>UM: User data with roles
    UM-->>AC: User object
    
    AC->>AC: verifyPassword(password, hashedPassword)
    
    AC->>UM: updateLastLogin(userId)
    UM->>DB: UPDATE users SET last_login = NOW()
    DB-->>UM: Success
    
    AC->>JWT: sign(userData, secret, options)
    JWT-->>AC: JWT token
    
    AC-->>R: {token, user}
    R-->>F: {success: true, data: {token, user}}
```

## Protected Endpoint Flow Sequence
This diagram shows the sequence for accessing a protected endpoint (e.g., GET /api/users).

```mermaid
sequenceDiagram
    participant F as Frontend
    participant R as Route
    participant AM as Auth Middleware
    participant RM as Role Middleware
    participant UC as User Controller
    participant UM as User Model
    participant DB as Database

    F->>R: GET /api/users
    Note over F,R: Authorization: Bearer <token>
    
    R->>AM: authenticateToken()
    AM->>AM: jwt.verify(token, secret)
    AM->>UM: getUserById(decoded.id)
    UM->>DB: SELECT with JOIN users, roles, user_roles
    DB-->>UM: User data with roles
    UM-->>AM: User object
    AM->>AM: Check user.status === 'active'
    AM-->>R: req.user = userData
    
    R->>RM: requireAdmin()
    RM->>RM: Check if user has 'admin' role
    RM-->>R: Continue if admin
    
    R->>UC: getAllUsers()
    UC->>UM: getAllUsers()
    UM->>DB: SELECT with JOIN users, roles, user_roles
    DB-->>UM: All users with roles
    UM-->>UC: Users array
    UC-->>R: {users, total}
    R-->>F: {success: true, data: {users, total}}
```

## Error Flow Sequence
This diagram shows what happens when authentication fails.

```mermaid
sequenceDiagram
    participant F as Frontend
    participant R as Route
    participant AM as Auth Middleware
    participant DB as Database

    F->>R: GET /api/users
    Note over F,R: Invalid or missing token
    
    R->>AM: authenticateToken()
    AM->>AM: jwt.verify(token, secret)
    Note over AM: Token verification fails
    
    AM-->>R: 401 Unauthorized
    R-->>F: {error: "Unauthorized", message: "Invalid token"}
```

## Key Benefits of Sequence Diagrams

### 1. **Debugging Efficiency**
- **Pinpoint Issues**: See exactly where failures occur
- **Timing Analysis**: Understand performance bottlenecks
- **Error Tracing**: Follow error paths step-by-step

### 2. **Development Planning**
- **API Design**: Validate endpoint design before implementation
- **Dependency Mapping**: Identify all components involved
- **Testing Strategy**: Plan comprehensive test coverage

### 3. **Team Alignment**
- **Frontend-Backend Coordination**: Both teams understand the flow
- **Database Optimization**: Identify query patterns
- **Security Review**: Verify authentication/authorization steps 