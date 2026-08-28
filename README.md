# TaskForge (TF) — Enterprise Hierarchical Task Management Platform

TaskForge is an enterprise task management platform designed for organizations with hierarchical depth where task delegation follows strict governance and multi-tier approval rules.

---

## 🚀 Running Locally with Docker & Docker Desktop

### Prerequisites

* Install and launch **Docker Desktop** (Windows / macOS / Linux).

---

### Option A: Using Docker Compose (Recommended)

1. Open your terminal in the project root folder.
2. Run:

```bash
docker compose up --build
```

3. Open your browser and navigate to:

```text
http://localhost:3000
```

To stop the container:

```bash
docker compose down
```

---

### Option B: Using Docker CLI Directly

1. **Build the Docker Image:**

```bash
docker build -t taskforge:latest .
```

2. **Run the Container:**

TaskForge uses Nginx on port `80` inside the container. The following command maps container port `80` to port `3000` on your local machine:

```bash
docker run -d -p 3000:80 --name taskforge-app taskforge:latest
```

3. **Access the App:**

Open the following URL in your web browser:

```text
http://localhost:3000
```

4. **Stop the Container:**

```bash
docker stop taskforge-app
```

5. **Remove the Container:**

```bash
docker rm taskforge-app
```

---

## 🌐 Deploying to Render with Docker

TaskForge can be deployed to Render using the included `Dockerfile`.

### Deployment Steps

1. Push the TaskForge project to a GitHub repository.
2. Sign in to Render.
3. Click **New +** and select **Web Service**.
4. Connect your GitHub repository.
5. Configure the service:

```text
Environment: Docker
Branch: main
```

6. Render will automatically detect the `Dockerfile` and build the application.
7. After the deployment completes, Render will provide a public URL for your TaskForge application.

The application runs through Nginx inside the Docker container on port `80`. Render handles routing external traffic to the deployed service.

---

## 💻 Running Locally without Docker (Node.js)

If you prefer running the application directly with Node.js:

1. **Install Dependencies:**

```bash
npm install
```

2. **Start the Development Server:**

```bash
npm run dev
```

3. **Open the Application:**

Navigate to:

```text
http://localhost:3000
```

---

## 1. Technology Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion
* **Architecture:** Hierarchical Multi-Tier Approval & Task Delegation Engine
* **Containerization:** Multi-stage Docker build using Alpine Linux and Nginx
* **Deployment:** Docker-compatible deployment with Render

---

## 2. Directory Structure

```text
TaskForge/
├── Dockerfile          # Multi-stage Docker build and Nginx deployment
├── docker-compose.yml  # One-click Docker Desktop orchestration
├── nginx.conf          # Production SPA routing and Nginx configuration
├── package.json        # Dependencies and application scripts
├── src/                # React and TypeScript source code
│   ├── components/     # UI views and modals
│   │   ├── Dashboard
│   │   ├── Approvals
│   │   ├── Hierarchy
│   │   └── Directory
│   ├── context/        # App state and hierarchical governance engine
│   └── types.ts        # TypeScript data models
└── README.md
```

---

## 3. Core Business Rules

### 1. Immediate Subordinate Rule

A manager or lead can assign tasks directly to their immediate subordinates without requiring additional approval.

### 2. Cross-Level Governance

Delegating a task to someone outside the direct reporting line automatically generates a multi-tier approval chain that follows the organization's management hierarchy.

### 3. Sequential Approval Workflow

Each manager in the approval hierarchy must review and approve the task before it is unlocked and assigned to the final assignee.

---

## 🐳 Docker Architecture

TaskForge uses a multi-stage Docker build:

1. The first stage uses Node.js to install dependencies and build the React/Vite application.
2. The production build is generated in the `dist` directory.
3. The second stage uses lightweight Nginx on Alpine Linux.
4. The built static files are copied into the Nginx web server.
5. Nginx serves the application and handles SPA routing.

The application listens on port `80` inside the Docker container.

For local development, Docker maps:

```text
localhost:3000 → container:80
```

---

## 📌 Production Notes

* The Nginx configuration supports React SPA routing.
* Static assets are cached for improved performance.
* Gzip compression is enabled.
* Docker provides a consistent production environment.
* Render can automatically build and deploy the application from the repository's `Dockerfile`.
