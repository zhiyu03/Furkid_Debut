# Furkid Debut（毛孩子出道计划）— 架构说明

本文档说明本仓库的**核心定位**、**技术栈**、**目录与模块划分**、**请求与数据流**以及**关键设计决策**，便于新成员或评审快速理解整体架构。

---

## 1. 项目定位

**毛孩子出道计划** 是一款面向移动端（抖音风格窄屏）的 Web 体验：用户上传宠物照片，在四类配饰（头饰、妆容、造型、衣物）中点选图标，提交后由后端调用 **Replicate `openai/gpt-image-2`** 生成「变装定妆图」；同一次响应内还会根据规则计算 **出道潜力分**、档位与 **出道角色** 文案，用于结果页展示与分享话术。

典型场景：黑客松演示、无账号的纯前端互动 Demo。

---

## 2. 技术栈与运行形态

| 层级 | 技术 |
|------|------|
| 前端 | React 18、Vite、Tailwind CSS |
| 后端 | Express、Multer（上传）、官方 `replicate` SDK |
| AI | Replicate 托管的 `openai/gpt-image-2` |
| 语言 | 全仓库 **JavaScript**（无 TypeScript），便于快速迭代 |

**Monorepo**：根目录 `package.json` 使用 npm **workspaces** 管理 `client` 与 `server`。

- **开发**：`npm run dev` 通过 `concurrently` 同时启动后端（默认 `:3001`）与 Vite 开发服务器（默认 `:5173`）。浏览器应访问 **Vite 地址**，不要以后端端口当静态站打开。
- **生产**：`npm run build` 构建前端；`npm run start` 仅启动服务端（需已构建前端并由 Express 或反向代理按项目实际部署方式提供静态资源，以当前仓库脚本为准）。

---

## 3. 仓库顶层结构

```
Furkid_Debut/
├── package.json           # workspaces + dev/build/start 脚本
├── .env / .env.example    # 推荐在仓库根配置（见下文环境变量）
├── catalog/               # 前后端共享的「目录数据」
│   ├── itemCatalog.json   # 分类、每类上限、单品 id/emoji/label/prompt 片段
│   └── debutRoles.json    # 档位标签 + 角色池（规则化出道角色 UI）
├── client/                # Vite + React 前端
├── server/                # Express API + 业务服务
└── docs/                  # 项目文档（含本文）
```

**共享目录 `catalog/`**：商品与 prompt 片段的单一数据源。前端通过 Vite 别名 `@catalog` 指向 `../catalog`；服务端从磁盘读取同名 JSON 拼 prompt 与计分逻辑，避免前后端两套配置漂移。

---

## 4. 核心架构（逻辑视图）

```
┌─────────────────────────────────────────────────────────────┐
│  Browser（移动端壳层 ~430px）                                 │
│  React：选图 → 四类 Tab + 网格多选 → 提交「开始变装」          │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP（开发：Vite 代理 /api、/uploads）
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Express（server/）                                          │
│  POST /api/debut：Multer 落盘 → 拼 prompt → Replicate 或 mock │
│  静态托管 server/uploads/（生成图与上传原图 URL 供外网拉取）    │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS 可访问的 input image URL
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Replicate（gpt-image-2）                                    │
│  云端拉取 PUBLIC_BASE_URL/uploads/... 原图并返回合成结果       │
└─────────────────────────────────────────────────────────────┘
```

**要点**：

- 前端不直连 Replicate；**Token 与模型调用仅在后端**，避免密钥泄露。
- 真实跑图时，Replicate 必须在公网访问到上传原图，因此需要配置 **`PUBLIC_BASE_URL`**（HTTPS、非 localhost）。本地可用 ngrok / cloudflared 等暴露后端。

---

## 5. 前端模块职责（`client/src`）

| 区域 / 组件 | 职责 |
|-------------|------|
| `App.jsx` | 整体流程：`dress`（选装）→ `generating` → `result`；维护选中项并调用 `/api/debut` |
| `components/mobile/MobileShell` | 最大宽度约 430px、`100dvh`、控制溢出，模拟手机壳 |
| `SelectedSidebar` | 约 1/3 宽竖条：展示已选 chip |
| `MainImagePanel` | 主图区：上传 / 预览，主图优先布局 |
| `CategoryTabs` | 四类分类 Tab |
| `ItemGrid` | 子面板网格（如四列黄块），选项来自 `itemCatalog` |
| `ResultView` | 前后对比、出道分与角色、分享文案、重置回选装 |

开发环境下 **`vite.config.js`** 将 `/api`、`/uploads` 代理到本机后端；并从根目录或 `server/.env` 读取 `PORT`，与后端端口对齐。

---

## 6. 后端模块职责（`server/`）

| 路径 | 职责 |
|------|------|
| `index.js` | 应用入口：信任代理、挂载静态 `uploads`、注册路由 |
| `routes/debut.js` | **主路径**：`POST /api/debut` — 接收 multipart、构建 prompt、调 Replicate 或 mock、返回 JSON（含图片 URL、出道分与角色等） |
| `services/debutPrompt.js` | 根据选项与 catalog 构建英文 prompt |
| `services/debutScore.js` | 规则 **raw 分** + 线性映射到对外 **`debutScore`（80–100）**；档位按展示分区间 |
| `services/debutRolePick.js` | 按档位与选择从 `debutRoles.json` 取角色 |
| `services/debutOutcome.js` | 聚合分数、档位、角色，供 API 一次返回 |
| `services/replicateDebut.js` | 封装 `runGptImage2` 等 Replicate 调用 |

**存储**：无数据库；上传与生成结果落在 **`server/uploads/`**，通过 **`/uploads/<filename>`** 对外提供静态访问。

---

## 7. 核心 API 与响应语义（概念）

- **`POST /api/debut`**：请求体为 multipart（含图片文件 + 选项 JSON 等，以 `routes/debut.js` 实现为准）。
- **成功响应**（无论真实模型或 mock）在业务上应包含结果图可访问 URL，以及由 `computeDebutOutcome` 产出的字段，例如：**`debutScore`**（展示向 80–100）、**`debutScoreRaw`**（规则原始分）、**`debutTierId`** / **`debutTierLabel`**、**`debutRole`**（含 `title`、`tagline`、`emoji` 等），供结果页与分享使用。

**Mock 模式**：当 **`REPLICATE_API_TOKEN`** 未配置时，服务端可将上传文件拷贝为新文件名返回，便于无密钥联调 UI 与出道分展示。

---

## 8. 环境变量与加载顺序

推荐在**仓库根目录**维护 `.env`（见 `.env.example`）。服务端启动时会加载环境变量：**先读根目录 `.env`，再读 `server/.env` 并覆盖同名变量**。

| 变量 | 作用 |
|------|------|
| `REPLICATE_API_TOKEN` | Replicate API Token；为空则走 mock |
| `PUBLIC_BASE_URL` | 公网可访问的服务根 URL（无尾部斜杠），供 Replicate 拉原图；不可用 `http://localhost` 等云端不可达地址 |
| `DEBUT_ASPECT_RATIO` | 可选：`1:1`、`3:2`、`2:3`（模型限制） |
| `PORT` | 后端监听端口，默认 `3001` |

**注意**：若存在 `server/.env`，其中**不要留空的 `REPLICATE_API_TOKEN=`**，否则会覆盖根目录已填的 Token。

---

## 9. 关键设计决策与约束

| 决策 | 说明 |
|------|------|
| 无数据库 | 降低运维与黑客松成本；状态以文件 + 单次响应为主 |
| 无用户体系 | Demo 级；不做登录鉴权 |
| 共享 catalog | 前后端同源 JSON，减少重复配置 |
| 前后端分离 + 开发代理 | 避免 CORS 与跨端口手工配置；生产需按部署统一域名或网关 |
| 全 JS | 刻意省略 TS，换取实现速度（适合短期活动型项目） |

**产品约束**：目标为 **移动端视口**（约 430px 宽壳层），桌面端为次要适配场景。

---

## 10. 扩展与维护提示

- **新增 catalog 单品**：编辑 `catalog/itemCatalog.json` 对应 `items.<categoryId>`，补充 `id`、`emoji`、`label`、`prompt`（英文，供视觉模型）；按需调整 `maxPerCategory`。
- **调整出道角色池**：编辑 `catalog/debutRoles.json`，并与 `debutScore.js` / `debutRolePick.js` 规则保持一致。
- **联调真实出图**：除 Token 外必须配置可公网访问的 **`PUBLIC_BASE_URL`**，并保证 `/uploads/...` 对该域名可达。

---

## 11. 相关文档

- 根目录 **`README.md`**：快速启动与功能概要  
- **`CLAUDE.md`**：面向 AI/协作者的命令、目录树与实现细节备忘  
- **`docs/ARCHITECTURE.md`**（本文）：架构级总览  

若部署方式或静态资源托管与上述默认脚本不一致，以实际 `server/index.js` 与 CI/CD 配置为准，并建议将差异补记到内部运维文档。
