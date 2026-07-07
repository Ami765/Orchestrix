# Orchestrix — Enterprise Swarm Intelligence

Orchestrix is a high-performance multi-agent swarm orchestration platform built to execute structured credit underwriting and vendor audit diligence pipelines.

---

## Development Environment Setup

This section provides comprehensive instructions for setting up the local development environment using VS Code, a terminal, and containerized services for PostgreSQL, Redis, and a FastAPI-based backend, as well as instructions for running the current Vite + Express full-stack workspace.

### Prerequisites

Before starting, ensure you have the following installed on your host system:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **Yarn**
- **Docker** and **Docker Compose**
- **VS Code** (with recommended extensions: *Tailwind CSS IntelliSense*, *ESLint*, *Prettier*)

---

### 1. External Infrastructure Setup (Docker Compose)

To run the backing database services (**PostgreSQL** and **Redis**) easily on your local machine, use the following `docker-compose.yml` configuration:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: orchestrix-postgres
    restart: always
    environment:
      POSTGRES_USER: orchestrix_user
      POSTGRES_PASSWORD: orchestrix_password
      POSTGRES_DB: orchestrix_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: orchestrix-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

#### Starting the Services

Open your terminal and run the following command in the directory containing `docker-compose.yml`:

```bash
docker compose up -d
```

---

### 2. FastAPI Backend Setup & Running

For a FastAPI-based python implementation of the backend, follow these environment and terminal commands:

#### Environment Variables Configuration (`.env`)

Create a `.env` file in your FastAPI directory:

```env
# Database Settings
DATABASE_URL="postgresql://orchestrix_user:orchestrix_password@localhost:5432/orchestrix_db"

# Redis Cache Settings
REDIS_URL="redis://localhost:6379/0"

# Gemini AI Credentials
GEMINI_API_KEY="your_gemini_api_key_here"

# Server Host and Port
HOST="0.0.0.0"
PORT=8000
```

#### Installation and Execution

1. **Create and Activate a Virtual Environment:**
   ```bash
   python -venv venv
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   .\venv\Scripts\activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install fastapi uvicorn sqlalchemy psycopg2-binary redis google-genai pydantic
   ```

3. **Launch the FastAPI Server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

---

### 3. Current Workspace Frontend & Express Server Setup

To run the current React (Vite) + Express full-stack workspace locally on your system:

#### Environment Variables Configuration (`.env`)

Copy `.env.example` to `.env` in the root folder:

```bash
cp .env.example .env
```

Ensure the `.env` file contains your credentials:
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
APP_URL="http://localhost:3000"
```

#### Terminal Commands to Run the App

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the App in Development Mode (Vite Dev Server + Express):**
   ```bash
   npm run dev
   ```
   *The development server will boot up and automatically bind to port `3000`.*

3. **Verify App Quality (Linter & Type Checks):**
   ```bash
   npm run lint
   ```

4. **Production Build & Compilation:**
   ```bash
   npm run build
   ```

5. **Start Production Built Server:**
   ```bash
   npm run start
   ```

---

### 4. VS Code Integration

For an optimal editing experience in VS Code, we recommend setting up `.vscode/settings.json` in your workspace:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"]
  ]
}
```
