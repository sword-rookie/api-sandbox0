# Database Architecture

This document serves as the master reference for all PostgreSQL database structures and schemas used in the Clarity Machine platform. It corresponds directly to our `golang-migrate` migration files located in `orchestrator/migrations`.

## Existing Schemas

### 1. Users (`users`)
Stores registered developers on the platform.
- **id**: UUID (Primary Key)
- **name**: TEXT (Not Null)
- **username**: TEXT (Unique, Not Null)
- **email**: TEXT (Unique, Not Null)
- **password_hash**: TEXT (Not Null)
- **provider**: TEXT (Default: 'local')
- **mfa_enabled**: BOOLEAN (Default: false)

### 2. Projects (`projects`)
A logical grouping of related sandboxes belonging to a user.
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key -> `users(id)`)
- **name**: TEXT (Not Null)
- **slug**: TEXT (Unique, Not Null)
- **description**: TEXT
- **status**: TEXT (Default: 'active', IN 'active', 'archived')
- **created_at / updated_at**: TIMESTAMPTZ

### 3. Sandboxes (`sandboxes`)
Individual ephemeral environments running user code and state.
- **id**: UUID (Primary Key)
- **project_id**: UUID (Foreign Key -> `projects(id)`)
- **user_id**: UUID (Foreign Key -> `users(id)`)
- **name**: TEXT (Not Null)
- **github_repo**: TEXT
- **github_branch**: TEXT
- **status**: TEXT (Default: 'pending', IN 'pending', 'building', 'running', 'sleeping', 'stopped', 'error')
- **live_url**: TEXT
- **last_active_at**: TIMESTAMPTZ
- **created_at / updated_at**: TIMESTAMPTZ

### 4. Sessions (`sessions`)
Used for tracking and revoking JWT refresh tokens.
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key -> `users(id)`)
- **token_hash**: TEXT (Unique)
- **expires_at**: TIMESTAMPTZ

### 5. Password Resets (`password_reset_tokens`)
Tracks time-bound forgot-password tokens.
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key -> `users(id)`)
- **token_hash**: TEXT (Unique)
- **expires_at**: TIMESTAMPTZ

### 6. Audit Logs (`audit_logs`)
Security and action tracking for users.
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key -> `users(id)`)
- **action**: TEXT
- **ip_address / user_agent**: TEXT

---

*Note: Always use `golang-migrate` when modifying schemas to ensure reproducible DB state across environments.*
