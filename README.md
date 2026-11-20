# Admission Tracker

Personal admission tracker for 2026-27 cycle (BUET, RUET, KUET, SUST, DU, RU).

Single-file web app with all personal data encrypted inside the HTML (AES-GCM-256,
PBKDF2-SHA256, 250k iterations). Safe to deploy to a public URL — nothing is
readable without the passcode.

## Files

- `index.html` — the app. Encrypted data + UI + crypto all embedded.
- `api/news.js` — Vercel Edge function that fetches Google News RSS server-side
  (bypasses CORS so the live feed works reliably).

## Deploy

Pushed to Vercel. Any push to `main` triggers an auto-deploy.

## Local dev

```
npx vercel dev
```

Opens on `http://localhost:3000` with the Edge function running locally.
Opening `index.html` directly over `file://` works too, but the news feed will
fall back to flaky public CORS proxies.
