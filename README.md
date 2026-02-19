# Lelwa: Real Estate Intelligence Ecosystem

Lelwa is a dual-platform real estate intelligence ecosystem for Dubai/UAE, consisting of a FastAPI backend and a Next.js frontend.

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL database (ideally Neon)

## Getting Started

### 1. Database Setup

Initialize your PostgreSQL database using the `schema.sql` file provided:

```bash
psql -d your_db_url -f schema.sql
```

### 2. Backend Setup

1.  **Environment Variables**: Copy `.env.example` to `.env` and fill in your credentials.
    ```bash
    cp .env.example .env
    ```
2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Run the Server**:
    ```bash
    python main.py
    ```
    The backend will be available at `http://localhost:8000`.

### 3. Frontend Setup

1.  **Install Dependencies**:
    ```bash
    cd frontend
    npm install
    ```
2.  **Environment Variables**: The frontend is pre-configured to use `http://localhost:8000` via `frontend/.env.local`.
3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    The dashboard will be available at `http://localhost:3000`.

## Project Structure

- `main.py`: FastAPI application entry point.
- `tools.py`: Deterministic logic for 18+ real estate tools.
- `schema.sql`: Database schema (tables and functions).
- `frontend/`: Next.js dashboard application.
- `entrestate_codex_spec_v1.json`: Project specification and tool definitions.
