# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**毛孩子出道计划 (Furkid Debut)** — AI pet makeover game for a 40-hour hackathon ("互动空间" track). An interactive Douyin experience that lets pets take the C-position spotlight. Users upload a pet photo, pick a style, get an AI-transformed image, and receive a fun AI fashion score.

## Commands

```bash
# Install everything (run once)
cd client && npm install && cd ../server && npm install

# Development — run both simultaneously
# Terminal 1:
cd server && npm run dev          # Express on :3001, --watch auto-restart

# Terminal 2:
cd client && npm run dev          # Vite dev server on :5173 with proxy to :3001

# Production build
cd client && npm run build        # Output to client/dist/

# Type check (no TS — use ESLint if added later)
```

## Architecture

```
client/                    # React 18 + Vite + Tailwind CSS
├── src/
│   ├── App.jsx            # Main state machine: UPLOAD → STYLE → GENERATING → RESULT
│   └── components/
│       ├── ImageUpload    # Drag-and-drop / camera capture
│       ├── StyleSelector  # 4 style cards (cny, cool, makeup, intern)
│       ├── ResultDisplay  # Before/after comparison
│       └── ScoreModal     # AI score popup
└── vite.config.js         # Proxies /api → localhost:3001

server/                    # Express + Multer
├── index.js               # App entry, mounts routes, serves uploads/
├── routes/
│   ├── generate.js        # POST /api/generate — upload + transform + auto-score
│   └── score.js           # POST /api/score — standalone scoring endpoint
└── services/
    ├── promptBuilder.js   # Maps style ID → English image-gen prompt
    ├── imageGen.js        # Image-to-Image API wrapper (mock fallback when no keys)
    └── scorer.js          # Vision LLM scorer (random fallback when no keys)
```

### Key design decisions

- **No database** — images are saved to `server/uploads/` and served as static files. Sufficient for a hackathon demo.
- **Mock fallbacks** — `imageGen.js` and `scorer.js` return placeholder data when `IMAGE_API_URL` / `VISION_API_URL` env vars are unset. This lets you develop the full UI flow without any API keys.
- **Vite proxy** — `/api/*` requests are proxied to the Express server in dev, avoiding CORS issues.
- **State machine in App.jsx** — four steps (`UPLOAD → STYLE → GENERATING → RESULT`) controlled by a single `step` state. Adding new steps means adding a new block in the JSX.

## Adding a new style

1. Add an entry to `STYLE_PROMPTS` in `server/services/promptBuilder.js` (id, prefix, details, suffix).
2. Add a matching entry to the `STYLES` array in `client/src/components/StyleSelector.jsx` (id, name, emoji, desc).

## Integrating real AI APIs

Both services follow the same pattern:
1. Set `*_API_URL` and `*_API_KEY` in `.env`.
2. Uncomment/replace the example `fetch` block in the service file.
3. The mock fallback only runs when env vars are empty.

### imageGen.js
- Input: file path + prompt string
- Output: path to generated image saved in `server/uploads/`
- Expects the API to accept a base64 image + text prompt and return a transformed image

### scorer.js
- Input: image URL + style info
- Output: `{ score: number, comment: string }`
- Expects a vision/chat-completion API that can accept image + text prompt

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
|---|---|
| `IMAGE_API_URL` | Image-to-Image endpoint (leave empty for mock) |
| `IMAGE_API_KEY` | API key for image generation |
| `VISION_API_URL` | Vision LLM endpoint for scoring (leave empty for mock) |
| `VISION_API_KEY` | API key for vision model |
| `PORT` | Server port (default 3001) |

## Constraints

- No TypeScript — plain JS throughout for speed.
- No database — file-based storage only.
- No authentication — this is a demo.
- Target mobile viewport (this is a Douyin/互动空间 project).
