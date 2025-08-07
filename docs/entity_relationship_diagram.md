# Entity Relationship Diagram (ERD): Authentication & User Management

## Database Schema Overview
This diagram shows the relationships between users, roles, and user_roles tables in the authentication system.

```mermaid
erDiagram
    users {
        bigint id PK
        string name
        string email UK
        string password
        timestamp email_verified_at
        enum status
        timestamp last_login
        string remember_token
        timestamp created_at
        timestamp updated_at
    }

    roles {
        int id PK
        string name UK
        text description
        timestamp created_at
        timestamp updated_at
    }

    user_roles {
        bigint user_id PK,FK
        int role_id PK,FK
        bigint assigned_by FK
        timestamp assigned_at
    }

    users ||--o{ user_roles : "has"
    roles ||--o{ user_roles : "assigned_to"
    users ||--o{ user_roles : "assigned_by"
```

## Table Relationships

### users → user_roles (One-to-Many)
- One user can have multiple roles
- Primary key: `users.id` → Foreign key: `user_roles.user_id`

### roles → user_roles (One-to-Many)
- One role can be assigned to multiple users
- Primary key: `roles.id` → Foreign key: `user_roles.role_id`

### users → user_roles (One-to-Many) - Assignment Tracking
- One user can assign roles to multiple other users
- Primary key: `users.id` → Foreign key: `user_roles.assigned_by`

## Key Features

### Users Table
- **id**: Auto-incrementing primary key
- **email**: Unique constraint for login
- **password**: Bcrypt hashed
- **status**: 'active' or 'inactive'
- **last_login**: Tracks user activity

### Roles Table
- **name**: Unique role names (admin, operator, viewer)
- **description**: Human-readable role descriptions

### User_Roles Table
- **Composite Primary Key**: (user_id, role_id)
- **assigned_by**: Tracks who assigned the role
- **assigned_at**: Timestamp of role assignment 