# Frontend

React UI for LeaveDesk (Admin panel + Employee portal).

## Stack

- React + TypeScript
- Vite
- React Router
- Tailwind CSS

## Setup

From repo root:

```bash
npm install --prefix frontend
npm run dev:frontend
```

Or inside this folder:

```bash
npm install
npm run dev
```

App runs at **http://localhost:5173**

In development, `/api` is proxied to the backend (`http://localhost:4000`).

## Build

```bash
npm run build
```

Output: `dist/`

## Environment

Optional `.env` for production / free host:

```env
VITE_API_URL=https://your-api.onrender.com
```

Leave empty for local proxy.

## Structure

```text
src/
├── api/           # HTTP client + types
├── components/    # Shared UI + shell
├── context/       # Auth state
├── lib/           # Leave-day helpers
└── pages/         # Auth, admin, employee screens
```

## Related

- Backend: [../backend/README.md](../backend/README.md)
- Docs: [../docs/README.md](../docs/README.md)
