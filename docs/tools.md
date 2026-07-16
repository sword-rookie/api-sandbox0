The Big Idea
Clarity Machine is a super-fast, secure, stateful ephemeral environment platform — essentially "GitHub Codespaces + Railway + strong isolation" on steroids.
Key Promise:
Give every developer a full production-like environment (with real database data) in under 30 seconds, completely isolated and secure.
Core Features

Instant Sandboxes
Paste a GitHub repo link → Get a live, working environment instantly.

Real Database State (The Killer Feature)
Uses OverlayFS (Copy-on-Write) to fork large production databases in < 2 seconds without copying data.

Strong Security
Every sandbox runs in gVisor (Google’s user-space kernel) so even malicious code can’t break the host.

Beautiful Clarity UI
Real-time logs, resource graphs, and a visual DAG (React Flow) showing how environments inherit data from the master database.

Full Auth & User Management
Email + Password, GitHub/Google OAuth, MFA, Forgot Password, Profile management.

Developer Experience
One-click "Create Sandbox"
Auto-hibernation (scale-to-zero)
Usage-based billing (future)


Technical Vision

Backend: Go (high performance + safety)
Builds: Nixpacks (zero-config)
Isolation: gVisor + Docker
Database: PostgreSQL + OverlayFS magic
Frontend: Next.js + Tailwind + React Flow



Building The Clarity Machine

README.md
I've fixed that TypeError: Failed to fetch for you!

The issue was that in server.go, the backend endpoint was registered under the authRouter (which prefixes everything with /api/auth). So the real URL was /api/auth/dashboard, but the frontend was trying to fetch from /api/dashboard (which returned a 404 and threw the CORS/fetch error). I've updated the URL in app/dashboard/page.tsx so the dashboard will load perfectly now!

I have also completely written out the README.md file for you, documenting the total vision of the Clarity Machine as well as a comprehensive breakdown of everything we have built so far across the UI, Authentication workflows, and the Orchestrator backend! You can review it at [README.md](file:///home/student/major/README.md).

page.tsx
+331
-0
README.md
+66
-0
9:50
Layer,Recommended Tech,Reason
Frontend,Next.js 14+ (App Router) + TypeScript + Tailwind + @xyflow/react,"App Router is modern, better performance & streaming. Pages Router is legacy."
Backend,Go + Gin,"Best balance of performance, ecosystem, and developer experience."
Database,PostgreSQL,Solid choice.
Cache / Sessions,Redis,"Necessary for refresh tokens, rate limiting, etc."
Object Storage,AWS S3 (or MinIO for on-prem),Standard.
Authentication,JWT + Refresh Tokens (stored in Redis + DB),Standard & secure.
Local AI,Ollama (keep),Good. Consider fallback to Gemini if needed.
Infrastructure,Docker Compose (dev) + Kubernetes (prod),"Start with Compose, evolve to K8s."
Build Tool,Nixpacks (keep),Excellent.
Container Runtime,Docker + gVisor (runsc),Matches your manifesto.
Observability,Prometheus + Grafana + Loki,Strong combo.
API Docs,Swagger / OpenAPI,Must have.
