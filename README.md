# 毛孩子出道计划 (Furkid Debut)

40 小时 AI 黑客松 · 互动空间赛道 · 让你的毛孩子在抖音 C 位出道

## Quick Start

```bash
# 在仓库根目录 Furkid_Debut/

# 1. 安装依赖（根目录会安装 client + server）
npm install

# 2. 环境变量
cp .env.example .env
# 无 REPLICATE_API_TOKEN 时 /api/debut 会走本地 mock（复制上传图便于联调 UI）
# 真实出图需配置 Token，且需 PUBLIC_BASE_URL 指向公网可访问的 origin（Replicate 需拉取 /uploads 图片）

# 3. 同时启动后端 + 前端
npm run dev
```

- **请用 Vite 提示的地址打开页面**（一般为 http://localhost:5173，端口占用时可能是 5174 等）。**不要**用后端端口（如 :3001）当网页访问，易 404/白屏。
- 开发时，Vite 将 `/api`、`/uploads` 代理到本地 Express；后端默认 `http://localhost:3001`（可用根目录 `.env` 的 `PORT` 调整，需与 `client/vite.config.js` 里代理目标一致）。

## 功能概要

- **手机宽度壳**（约 430px、100dvh）：**左侧**为「已选装扮」竖条，**右侧**为上传/预览主图；下方为分类 Tab 与横向滑动的选项格。
- **四个分类**（`catalog/itemCatalog.json`）：**配饰**、**妆容**、**毛发造型**、**衣物**。配饰可多选至上限，其余每类单选；选中的条目会显示在左侧条带并可移除。
- **选项图标**：目录里每项的 `emoji` 可填 **Emoji 或图片 URL**（`http`/`https`）。前端在选项格、分类 Tab、已选条中带 URL 时按图片展示。
- **生成出道定妆** → `POST /api/debut`：按选项拼接英文 `prompt` 调 Replicate；响应中带 **出道潜力分**（展示向 80–100）、`debutScoreRaw`、档位与角色文案等。未配置 Token 时返回本地上传图拷贝，便于联调。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 同时启动 client（Vite）与 server（Express） |
| `npm run build` | 构建前端到 `client/dist` |
| `npm run build:interactive-space` | 构建后同步到 **`index.html` + `assets/`（仓库根目录，作为静态入口）** 以及 `interactive-space/` |
| `npm run start` | 生产态仅启动后端（需先 `npm run build`） |

## 目录速览

- `catalog/itemCatalog.json`：分类、每类件数上限、可选项（`id` / `label` / `emoji` / `prompt`）及推荐搭配。
- `catalog/debutRoles.json`：段位与角色池，供结果页与分享文案使用。
- `client/`：React 18 + Vite + Tailwind，结果页含对比 Tab、分享面板、潜力分与角色标签等。
- `server/`：Express + Multer + Replicate 出图；上传与结果文件在 `server/uploads/`（无数据库）。

## 环境变量

详见根目录 [`.env.example`](./.env.example)。常用项：

| 变量 | 作用 |
| --- | --- |
| `REPLICATE_API_TOKEN` | Replicate 调用密钥；留空走 mock |
| `PUBLIC_BASE_URL` | 公网可访问的站点 origin（**无尾斜杠**），Replicate 需能访问 `.../uploads/...` |
| `PORT` | 本地后端端口，默认 3001 |
| `DEBUT_ASPECT_RATIO` | 可选 `1:1` / `3:2` / `2:3` |

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Express + Multer + [replicate](https://www.npmjs.com/package/replicate)
- **AI**: 图像能力见 `server/services/replicateDebut.js` 与根目录环境变量

更多架构与约束可参阅仓库内 [`CLAUDE.md`](./CLAUDE.md) 与 `docs/`。
