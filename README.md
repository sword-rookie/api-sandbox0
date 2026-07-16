# Clarity Machine

Clarity Machine is a next-generation infrastructure provisioning platform and visual API builder. 

## 🌌 The Vision & Architecture
The core objective of Clarity Machine is to build a high-performance, **Unreal Engine 5-inspired node-based visual workflow editor** that orchestrates complex infrastructure.

> **Read the Manifesto:** For the full problem framing (The Staging Bottleneck) and our product philosophy, read [docs/vision.md](docs/vision.md).
> 
> **View the Architecture Status:** For a breakdown of our 5 Technical Pillars and an honest status tracker of what is currently built vs planned, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 🚀 Actual Progress (Until Now)

We have successfully established the foundational layer of the application, focusing heavily on robust identity management, security, and the core dashboard interface.

### 1. User Interface & Experience (Next.js)
- **Design System:** Implemented a dark cybernetic theme using Tailwind CSS, featuring a beautiful `TopNavBar` and responsive sidebar.
- **Dynamic Dashboard:** A fully interactive dashboard that greets the user by name, displays dynamic statistics, and lists their recent projects and active sandboxes (currently wired to a mock backend endpoint while the provisioning engine is built).
- **Settings & Profile:** Developed a profile settings page featuring drag-and-drop avatar uploading with live client-side previewing.
- **Routing & Sessions:** Built a robust client-side `AuthContext` to protect private routes and seamlessly redirect logged-out users.

### 2. Authentication & Identity (Go + PostgreSQL)
- **JWT Session Management:** Secure, stateful authentication using `HttpOnly` cookies (`access_token` and `refresh_token`), complete with secure server-side logout endpoints to destroy sessions.
- **User Workflows:** Fully functional endpoints for Registration, Login, Forgot Password, and Secure Password Resets using time-bound tokens.
- **Multi-Factor Authentication (MFA):** Backend support for generating and verifying TOTP (Time-based One-Time Password) secrets for two-factor authentication during the login process.
- **Avatar Uploads:** A secure file upload endpoint with strict MIME-type validation (JPEG/PNG/WebP) and size limits.

### 3. Backend Architecture (The Orchestrator)
- **Structured Routing:** Organized `gorilla/mux` routing with dedicated authentication and profile subrouters.
- **Security Middleware:** Implemented global CORS policies and API rate-limiting to prevent brute-force attacks.
- **Data Transfer Objects (DTOs):** Standardized JSON responses for clear, predictable frontend-backend communication.
- **Database Migrations:** PostgreSQL schema initialized with tables for `Users`, `Sessions`, `Audit Logs`, and `Password Resets`.

---

## 🛠️ Tech Stack
### Layer & Recommended Tech

- **Frontend:** Next.js 14+ (App Router) + TypeScript + Tailwind + @xyflow/react
  - *Reason:* App Router is modern, offers better performance & streaming.
- **Backend:** Go + Gin
  - *Reason:* Best balance of performance, ecosystem, and developer experience.
- **Database:** PostgreSQL
  - *Reason:* Solid, industry-standard choice.
- **Cache / Sessions:** Redis `[PLANNED]`
  - *Reason:* Necessary for refresh tokens, rate limiting, etc.
- **Object Storage:** AWS S3 (or MinIO for on-prem)
  - *Reason:* Standard.
- **Authentication:** JWT + DB
  - *Reason:* Standard & secure.
- **Local AI:** Ollama (with fallback to Gemini)
  - *Reason:* Good for local, cost-effective inference.
- **Infrastructure:** Docker Compose (dev) + Kubernetes (prod)
  - *Reason:* Start simple with Compose, evolve to K8s for scale.
- **Build Tool:** Nixpacks
  - *Reason:* Excellent for fast, reliable builds.
- **Container Runtime:** Docker + gVisor (runsc)
  - *Reason:* Matches the security manifesto for isolated sandboxing.
- **Observability:** Prometheus + Grafana + Loki
  - *Reason:* Strong combo for metrics and logging.
- **API Docs:** Swagger / OpenAPI
  - *Reason:* Must have for API discoverability.
