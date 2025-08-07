# Data Flow Diagram (DFD): Authentication & User Management

## Architecture Overview
This diagram shows the data flow for authentication and user management endpoints, including the proper flow through controllers and models.

```mermaid
flowchart TD
    subgraph "Frontend (React/Next.js)"
        FE["Frontend Application"]
    end

    subgraph "Backend API Layer"
        subgraph "Routes"
            AR["/api/auth/* Routes"]
            UR["/api/users/* Routes"]
        end
        
        subgraph "Controllers"
            AC["Auth Controller"]
            UC["User Controller"]
        end
        
        subgraph "Middleware"
            AM["Auth Middleware"]
            RM["Role Middleware"]
        end
        
        subgraph "Models"
            UM["User Model"]
            RLM["Role Model"]
        end
    end

    subgraph "Database (MySQL)"
        DBU[(users table)]
        DBR[(roles table)]
        DBUR[(user_roles table)]
    end

    %% Authentication Flow
    FE -->|"POST /api/auth/login"| AR
    AR -->|"email, password"| AC
    AC -->|"getUserByEmail"| UM
    UM -->|"SELECT with JOIN"| DBU
    UM -->|"SELECT with JOIN"| DBUR
    UM -->|"SELECT with JOIN"| DBR
    AC -->|"JWT token + user data"| FE

    FE -->|"GET /api/auth/me"| AR
    AR -->|"authenticateToken"| AM
    AM -->|"getUserById"| UM
    UM -->|"SELECT with JOIN"| DBU
    UM -->|"SELECT with JOIN"| DBUR
    UM -->|"SELECT with JOIN"| DBR
    AM -->|"user data"| AC
    AC -->|"user info"| FE

    FE -->|"PUT /api/auth/profile"| AR
    AR -->|"authenticateToken"| AM
    AM -->|"user data"| AC
    AC -->|"updateUser/updatePassword"| UM
    UM -->|"UPDATE"| DBU
    AC -->|"updated user"| FE

    %% User Management Flow (Admin Only)
    FE -->|"POST /api/users"| UR
    UR -->|"authenticateToken"| AM
    AM -->|"user data"| RM
    RM -->|"requireAdmin"| UC
    UC -->|"createUser"| UM
    UM -->|"INSERT"| DBU
    UC -->|"assignRole"| UM
    UM -->|"INSERT"| DBUR
    UC -->|"new user data"| FE

    FE -->|"GET /api/users"| UR
    UR -->|"authenticateToken"| AM
    AM -->|"user data"| RM
    RM -->|"requireAdmin"| UC
    UC -->|"getAllUsers"| UM
    UM -->|"SELECT with JOIN"| DBU
    UM -->|"SELECT with JOIN"| DBUR
    UM -->|"SELECT with JOIN"| DBR
    UC -->|"users list"| FE

    FE -->|"POST /api/users/:id/role"| UR
    UR -->|"authenticateToken"| AM
    AM -->|"user data"| RM
    RM -->|"requireAdmin"| UC
    UC -->|"assignRole"| UM
    UM -->|"INSERT/UPDATE"| DBUR
    UC -->|"success message"| FE

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef routes fill:#f3e5f5
    classDef controllers fill:#e8f5e8
    classDef middleware fill:#fff3e0
    classDef models fill:#fce4ec
    classDef database fill:#f1f8e9

    class FE frontend
    class AR,UR routes
    class AC,UC controllers
    class AM,RM middleware
    class UM,RLM models
    class DBU,DBR,DBUR database
```

## Key Components Explained

### Frontend Layer
- **Frontend Application**: React/Next.js application that makes API calls

### Backend API Layer
- **Routes**: Express routes that define API endpoints
- **Controllers**: Business logic handlers for authentication and user management
- **Middleware**: JWT authentication and role-based authorization
- **Models**: Database interaction layer with SQL queries

### Database Layer
- **users table**: Stores user information (id, name, email, password, status, etc.)
- **roles table**: Stores available roles (admin, operator, viewer)
- **user_roles table**: Junction table linking users to their roles

## Data Flow Patterns

### Authentication Flow
1. Frontend sends login credentials
2. Route → Auth Controller → User Model → Database
3. Database returns user data with roles
4. Auth Controller generates JWT token
5. Frontend receives token and user data

### Protected Endpoint Flow
1. Frontend sends request with JWT token
2. Route → Auth Middleware (validates token)
3. Role Middleware (checks permissions)
4. Controller → Model → Database
5. Database returns data
6. Frontend receives response

### User Management Flow (Admin Only)
1. Frontend sends admin request with JWT token
2. Route → Auth Middleware → Role Middleware (admin check)
3. User Controller → User Model → Database
4. Database performs CRUD operations
5. Frontend receives response 