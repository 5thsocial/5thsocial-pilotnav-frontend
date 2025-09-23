
# 5thSocial • Pilot Navigation (Frontend)

React + Vite + TypeScript app for the **Pilot Nav** shell (liquid-glass sidebar + icons + top bar). It loads app/menu data from `/nav/apps` and `/nav/menu` or falls back to built-in data for preview.

## Run

```bash
npm install
npm run dev
# open http://localhost:5173
```

## Configure API (optional)
Create a `.env` file:
```
VITE_API_BASE=http://localhost:4000/api
```
If not provided, the shell uses built-in fallbacks so you still see the UI.
