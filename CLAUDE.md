# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**毛孩子出道计划 (Furkid Debut)** — AI pet makeover for a hackathon / Douyin-style mobile web experience. Users upload a pet photo, pick accessories (headwear, makeup, styling, clothing) from icon grids, then **开始变装** calls the backend which runs **Replicate `openai/gpt-image-2`** (or a local mock when `REPLICATE_API_TOKEN` is unset).

## Commands

```bash
# 在仓库根目录 Furkid_Debut/ — 安装一次（npm workspaces 会装 client + server）
npm install

# 一条命令同时启动后端（默认 :3001，可由根目录 .env 的 `PORT` 修改）与前端（Vite，默认 :5173）
npm run dev
# 浏览器请打开 Vite 给出的地址（如 http://localhost:5173），不要打开后端端口当网页用

# 若仍想分开跑：
# cd server && npm run dev
# cd client && npm run dev

# 生产构建前端
npm run build

# 仅启动生产态后端（需先 npm run build）
npm run start
```

## Architecture

```
catalog/
└── itemCatalog.json       # Shared: categories, per-category max counts, items + prompt fragments

client/                    # React 18 + Vite + Tailwind CSS
├── vite.config.js         # Proxies /api and /uploads → :3001; alias @catalog → ../catalog
├── src/
│   ├── App.jsx            # dress → generating → result; selections + /api/debut
│   └── components/mobile/
│       ├── MobileShell      # max-w 430px, 100dvh, overflow hidden
│       ├── SelectedSidebar  # ~34% width: vertical selected chips
│       ├── MainImagePanel   # flex-1: upload / preview (主图优先)
│       ├── CategoryTabs     # 头饰 / 妆容 / 造型 / 衣物
│       ├── ItemGrid         # max-h ~22vh, 4-col yellow tiles
│       └── ResultView       # before / after + reset

server/                    # Express + Multer + Replicate
├── index.js               # trust proxy; static /uploads; routes
├── routes/
│   ├── debut.js           # POST /api/debut — multer + prompt + Replicate or mock copy
│   ├── generate.js        # @deprecated POST /api/generate
│   └── score.js           # @deprecated POST /api/score
└── services/
    ├── debutPrompt.js     # buildDebutPrompt(selections) from catalog
    ├── replicateDebut.js  # runGptImage2 → Buffer
    ├── promptBuilder.js   # legacy style prompts
    ├── imageGen.js
    └── scorer.js
```

### Key design decisions

- **No database** — uploads and outputs in `server/uploads/`.
- **Shared catalog** — `catalog/itemCatalog.json` is imported on the client via `@catalog` alias and read on the server from disk for prompt building.
- **Mock debut** — If `REPLICATE_API_TOKEN` is empty, `/api/debut` copies the uploaded file to a new name and returns it so the UI can be tested without Replicate.
- **Real Replicate** — Requires `REPLICATE_API_TOKEN` and **`PUBLIC_BASE_URL`** (HTTPS in production) so `input_images` URLs are reachable by Replicate’s servers (not `http://localhost:3001`).
- **Vite proxy** — `/api/*` and `/uploads/*` proxied to Express in dev.

## Adding a catalog item

1. Edit `catalog/itemCatalog.json`: under `items.<categoryId>`, add `{ id, emoji, label, prompt }` (`prompt` is English for the vision model).
2. Adjust `maxPerCategory` if needed.

## Environment Variables

Copy `.env.example` to `.env` in the **repo root** (推荐). 可选再建 `server/.env` 只放本机端口等；**勿在 `server/.env` 里留空的 `REPLICATE_API_TOKEN=`**，否则会盖住根目录已填的 Token。服务端启动时会先读根 `.env`，再以 `server/.env` 覆盖同名变量。

| Variable | Purpose |
|---|---|
| `REPLICATE_API_TOKEN` | Replicate API token for `openai/gpt-image-2` |
| `PUBLIC_BASE_URL` | Public origin for `/uploads/...` URLs (no trailing slash), required for real runs |
| `DEBUT_ASPECT_RATIO` | Optional: `1:1`, `3:2`, or `2:3` only (model limit); default `2:3` |
| `PORT` | Server port (default 3001) |

Legacy: `IMAGE_API_*`, `VISION_API_*` for deprecated `/api/generate` and `/api/score`.

## Constraints

- No TypeScript — plain JS throughout for speed.
- No database — file-based storage only.
- No authentication — demo.
- Target mobile viewport (max width ~430px shell).
