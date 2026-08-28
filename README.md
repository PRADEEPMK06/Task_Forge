# TaskForge (TF) — Enterprise Hierarchical Task Management Platform

TaskForge is an enterprise task management platform designed for organizations with hierarchical depth where task delegation follows strict governance and multi-tier approval rules.

---

## 🚀 Running Locally with Docker & Docker Desktop

### Prerequisites
- Install and launch **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Windows / macOS / Linux).

---

### Option A: Using Docker Compose (Recommended)

1. Open your terminal in the project root folder.
2. Run:
   ```bash
   docker compose up --build
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

To stop the container:
```bash
docker compose down
```

---

### Option B: Using Docker CLI directly

1. **Build the Docker Image:**
   ```bash
   docker build -t taskforge:latest .
   ```

2. **Run the Container:**
   ```bash
   docker run -d -p 3000:3000 --name taskforge-app taskforge:latest
   ```

3. **Access the App:**
   Open `http://localhost:3000` in your web browser.

4. **Stop / Remove Container:**
   ```bash
   docker stop taskforge-app
   docker rm taskforge-app
   ```

---

## 💻 Running Locally without Docker (Node.js)

If you prefer running directly with Node:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Dev Server:**
   ```bash
   npm run dev
   ```

3. **Open:**
   Navigate to `http://localhost:3000`.

---

## 1. Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion
- **Architecture**: Hierarchical Multi-Tier Approval & Task Delegation Engine
- **Containerization**: Multi-stage Docker (Alpine Linux + Nginx)

---

## 2. Directory Structure
```text
TaskForge/
├── Dockerfile          # Multi-stage Docker build & Nginx deployment
├── docker-compose.yml  # One-click Docker Desktop orchestration
├── nginx.conf          # Production SPA routing configuration
├── package.json        # Dependencies & scripts
├── src/                # React & TypeScript source code
│   ├── components/     # UI Views & Modals (Dashboard, Approvals, Hierarchy, Directory)
│   ├── context/        # App state & Hierarchical governance engine
│   └── types.ts        # TypeScript data models
└── README.md
```

---

## 3. Core Business Rules
1. **Immediate Subordinate Rule**: A manager/lead can assign tasks directly to direct subordinates without delay.
2. **Cross-Level Governance**: Delegating to someone outside the direct reporting line automatically generates a multi-tier approval chain traversing the management hierarchy.
3. **Sequential Approval Workflow**: Each manager reviews and approves before the task is unlocked for the assignee.

