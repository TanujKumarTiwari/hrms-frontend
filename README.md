# HRMS Lite Frontend

Frontend for HRMS Lite with React (primary) and legacy static UI.

## Folder Structure

```text
frontend/
  react/
    package.json
    vite.config.js
    src/
  static/
    index.html
    styles.css
    app.js
```

## React App (Primary)

### Install and Run

```bash
cd react
npm install
npm run dev
```

Open: `http://localhost:5173`

### Backend Dependency

- React app expects backend API at `http://127.0.0.1:8000`.
- Vite proxy is configured in `react/vite.config.js` for `/api`.

## Build

```bash
cd react
npm run build
```

Build output: `frontend/react/dist`

## Deploy React App to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, import the repository.
3. Set project settings:
   - Framework Preset: `Vite`
   - Root Directory: `react`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable in Vercel:
   - `VITE_API_URL=https://your-backend-domain.com`
5. Deploy.

Notes:
- The proxy in `react/vite.config.js` is only for local development (`npm run dev`).
- In production, API calls use `VITE_API_URL` (configured in `react/.env.example`).

## Legacy Static UI

- Files are under `frontend/static`.
- Served by FastAPI backend at `http://localhost:8000`.
