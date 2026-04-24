# 毛孩子出道计划 (Furkid Debut)

40 小时 AI 黑客松 · 互动空间赛道 · 让你的毛孩子在抖音 C 位出道

## Quick Start

```bash
# 1. Install dependencies
cd client && npm install
cd ../server && npm install

# 2. Configure API keys (optional for dev — falls back to mock)
cp ../.env.example ../.env
# Edit .env with your API keys

# 3. Start both servers
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:3001

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Express + Multer
- **AI**: Image-to-Image API + Vision LLM (pluggable)
