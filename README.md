# IFS - Postgres-backed Items API

This project adds a small Express server that stores records in PostgreSQL and a front-end UI in `index.html` that interacts with the API.

Features
- Express API with CRUD endpoints: `GET/POST/PUT/DELETE /api/items`
- PostgreSQL (production-ready) using `pg` and `DATABASE_URL`
- Simple UI in `index.html` that uses the API with a localStorage fallback
- Docker Compose configuration to run Postgres + the server

Quick start (locally without Docker)

1. Install Node dependencies:

```powershell
cd c:\Users\Admin\Desktop\ifs
npm install
```

2. Create a Postgres database and set `DATABASE_URL` (see `.env.example`) or run via Docker (recommended below).

3. Start the server:

```powershell
npm start
```

The server listens on `http://localhost:3000` and the UI expects the API at `http://localhost:3000/api`.

Run with Docker Compose (recommended for quick local Postgres)

```powershell
cd c:\Users\Admin\Desktop\ifs
docker-compose up --build
```

This brings up Postgres (`db`) and the Node server (`server`). The server will auto-create the `items` table on first start.

Notes
- For production use you should add proper migrations (e.g., with `knex` or `sequelize`), secrets management, and connection pooling tuning.
- The front-end currently maps some container fields to a generic `items` table; adapt the server schema and UI mapping as needed for your data model.
