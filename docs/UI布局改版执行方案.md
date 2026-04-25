# UI 布局改版执行方案（线框对齐版）

> 目标：将当前「左窄图 + 右竖条分类」改为线框所示结构：**上区左侧 = 已选装扮列表，上区右侧 = 主图；下区上排 = 分类 Tab；下区黄格 = 当前分类下的可选条目**。数据与 **`POST /api/debut`** 契约不变。

---

## 1. 需求理解（与线框对齐）

| 区域 | 线框含义 | 数据 / 行为 |
|------|-----------|--------------|
| **右上绿色「图片区域」** | 宠物主图 / 上传后预览 | `imagePreview` + 上传入口（可叠在空态上） |
| **左上灰底 + 蓝色块「已选装扮」** | 用户已选、按类展示的摘要 | `selections[]` → 每块显示 `emoji + label`，可点删除 |
| **中间说明条** | 分类与内容区的关系 | 可省略或改为一行 Tab 下方的副标题 |
| **上排 Tab** | 头饰 / 妆容 / 造型 / 衣服 | `activeCategory` 单选；与 `catalog.categories` 一致 |
| **黄色网格** | 当前 Tab 下的可选图标 | `catalog.items[activeCategory]`；点击 = `toggleSelection` |
| **底部主按钮** | 开始变装 | 现有 `handleDebut`，`FormData(image + selections)` |

**与现版差异**：现版为 **左侧 1/3 图 + 右侧竖排四类按钮 + 全屏/底部 Sheet 选图标**；改版后为 **上排左右分栏（左选右图）+ 下排 Tab + 内嵌黄格网格**，**不再依赖** `CategoryPanel` 全屏遮罩（或保留为窄屏折叠备选）。

---

## 2. 信息架构与组件拆分

```
MobileShell
├── Header
├── EditorTop（flex-row, flex:1, min-height）
│   ├── SelectedSidebar      ← 左 34% 左右，可滚动
│   └── MainImagePanel       ← 右，绿色区域逻辑：object-cover + 圆角
├── CategoryTabs             ← 4 等分 Tab，sticky 可选
├── ItemGrid                 ← 黄格 3 列 grid，数据来自 catalog
├── MessageBar（错误 / mock 提示）
└── FooterCTA「开始变装」
```

**状态复用**：`imageFile` / `imagePreview` / `selections` / `activeCategory` / `step` / `result` 与现 `App.jsx` 一致；**删除或降级** `CategoryPanel` 的「必选路径」，改为 Tab 常驻 + Grid。

---

## 3. 与后端契约（不改）

- **`POST /api/debit`**：`multipart/form-data`
  - `image`：文件（继续走 `downscaleImageFile`）
  - `selections`：`JSON.stringify([{ categoryId, itemId }, ...])`
- **无需改** `server/routes/debut.js`、`debutPrompt.js`、`itemCatalog.json` 字段名。

---

## 4. 实现阶段

| 阶段 | 内容 | 验收 |
|------|------|------|
| **P1** | 新建 `EditorTop.jsx`：左 `SelectedSidebar`、右 `MainImagePanel`；从 `App` 拆 props | 上传后布局与线框比例接近（左 ~34% / 右 ~66%） |
| **P2** | 新建 `CategoryTabs.jsx` + `ItemGrid.jsx`；`activeCategory` 默认 `headwear` 或第一项 | 切换 Tab 黄格内容切换；点格 toggle 选中 |
| **P3** | 移除对 `CategoryRail` / `CategoryPanel` 的依赖；`App.jsx` 只拼装新树 | 全流程可选装饰 + 变装成功 |
| **P4** | 视觉：侧栏蓝块样式、黄格圆角、Tab active 态；`GENERATING` / `ResultView` 保持 | 手机宽度 390± 无横向溢出 |

---

## 5. 样式与无障碍

- Tab：`role="tablist"` / `role="tab"`，`aria-selected`。
- 黄格按钮：`aria-label` 用 `item.label`。
- 左栏列表：键盘/大屏可后续增强，MVP 可只做点击删除。

---

## 6. 风险与回滚

- **小屏高度**：上区 + Tab + Grid + CTA 可能挤；上区设 `min-height` + 左栏 `max-height` + `overflow-y-auto`。
- **回滚**：保留 Git 分支；旧组件文件可暂留 `components/mobile/_legacy/` 直至稳定后删。

---

## 7. 效果图文件

- 静态线框页：**`docs/ui-effect-mockup.html`**（本地用浏览器打开即可）。
- 你提供的参考线框图：**`assets/image-627864bb-585f-4076-ba83-7dc2532aa1df.png`**（若已同步到仓库）。

---

## 8. 验收清单（Checklist）

- [ ] 主图仅在右上区域展示，上传/更换入口清晰。
- [ ] 左侧列表与 `selections` 同步，可单项移除。
- [ ] 四个 Tab 与黄格联动，与 `catalog` 一致。
- [ ] 「开始变装」仍调 `/api/debit`，无新增字段。
- [ ] `max-w-[430px]` 内无布局撑破。

---

**文档版本**：v1  
**依赖**：现有 `catalog/itemCatalog.json`、现有 debut API。
