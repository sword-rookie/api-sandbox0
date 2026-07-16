# Clarity Machine Architecture & Status

To achieve the promises of the Clarity Machine—specifically, the ability to deploy an isolated, secure, fully stateful replica of a production environment rapidly—the platform relies on a synthesis of systems engineering and artificial intelligence.

The architecture is defined by five foundational pillars. Below is the honest assessment of what is currently built versus what is planned.

---

### Pillar I: The Go Orchestration Engine
**Status:** `[PARTIAL]`

At the center of the platform sits an orchestration daemon written in Go (Golang). Currently, this orchestrator manages the HTTP routing, handles comprehensive JWT/MFA authentication, and interfaces with the Postgres database. 

*What's next:* The orchestrator must be expanded to manage the lifecycle of sandboxes, manipulate Linux kernel namespaces, and handle dynamic network routing.

### Pillar II: Zero-Configuration Builds via Nixpacks
**Status:** `[PARTIAL]`

The platform utilizes **Nixpacks**, a build tool that abstracts the containerization process by identifying dependency manifests and autonomously constructing a build plan. 

Currently, the orchestration engine shells out to `nixpacks build` for provided repositories. 
*What's next:* Implement comprehensive error recovery, retry logic, and fallback paths for failed builds.

### Pillar III: Sub-Second Data Virtualization via OverlayFS
**Status:** `[PLANNED]`

To solve the profound challenge of database state, the platform will implement Copy-on-Write (CoW) physics at the filesystem layer using Linux **OverlayFS**.

Rather than naively wrapping Kubernetes or provisioning empty databases, we target sub-second branching of production data. Similar to platforms like Neon or PlanetScale which solve database branching, Clarity Machine integrates this natively into the orchestration layer so compute and state are branched together in milliseconds.

### Pillar IV: Kernel-Level Security via gVisor
**Status:** `[PLANNED]`

Because the platform autonomously executes unreviewed code provided via GitHub URLs, standard Docker isolation is insufficient. The platform will enforce the use of **gVisor (runsc)** to intercept system calls and completely shield the host server's physical Linux kernel.

### Pillar V: The AI Cognitive Layer
**Status:** `[PLANNED]`

API Sandbox Links introduces proactive intelligence by embedding **Google Gemini** directly into the deployment pipeline. During the build phase, the Go Orchestrator will stream configuration files and database schemas to the Gemini API for instantaneous static analysis and semantic mock data generation, acting as an automated diagnostic engineer.
