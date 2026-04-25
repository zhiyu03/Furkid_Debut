# 毛孩子出道计划 (Furkid Debut)

40 小时 AI 黑客松 · 互动空间赛道 · 让你的毛孩子在抖音 C 位出道

## Quick Start

```bash
# 在仓库根目录 Furkid_Debut/

# 1. Install（在仓库根目录，一次安装 client + server）
npm install

# 2. Configure env（根目录 .env 与 server/.env 都会被尝试加载）
cp .env.example .env
# 无 REPLICATE_API_TOKEN 时 /api/debut 返回本地拷贝 mock；真实合成需 Token + PUBLIC_BASE_URL（公网 HTTPS）

# 3. 一条命令同时启动前后端
npm run dev
```

- **浏览器请打开 Vite 的地址**（一般为 http://localhost:5173；若端口被占用会是 5174 等）。**不要**用后端端口（如 :3001 / :3002）当网页打开，否则会 404 或白屏。
- 后端 API：默认 http://localhost:3001（与根目录 `.env` 里 `PORT` 一致）；Vite 已按该端口做代理。

## 功能概要

- 手机宽度外壳（约 430px）：左侧约 1/3 宠物主图，右侧四类（头饰 / 妆容 / 造型 / 衣物），点入子面板选图标；已选显示在主图下方条带，可点掉。
- **开始变装** → `POST /api/debut`：服务端按选项拼英文 prompt，调用 **Replicate `openai/gpt-image-2`**；未配置 Token 时返回上传图拷贝便于联调 UI。

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Express + Multer + [replicate](https://www.npmjs.com/package/replicate)
- **AI**: Replicate `openai/gpt-image-2`（旧版 `/api/generate` 仍保留为 deprecated）
