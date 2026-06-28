# 招标投标网站实现计划

## 1. Summary

构建一个纯前端静态的招标投标信息平台，部署到 GitHub Pages。支持两种角色（招标方、投标方），覆盖发布招标、浏览招标、提交投标、选择中标等核心流程。所有数据通过浏览器 localStorage 持久化，无需后端服务器和数据库，零成本运行。

## 2. Current State Analysis

- 工作目录为空，无任何现有代码或配置。
- 用户无技术背景，希望一步一步完成。
- 部署目标明确为 GitHub Pages，因此必须采用纯前端静态方案。
- 无付费服务，所有依赖均为免费开源方案。

## 3. Proposed Changes

### 3.1 技术栈

| 层级 | 选型 | 理由 |
|------|------|------|
| 构建工具 | Vite + React | 轻量、启动快、构建产物为纯静态文件，适合 GitHub Pages |
| 样式 | Tailwind CSS |  utility-first，快速搭建页面，无需写大量自定义 CSS |
| 路由 | React Router DOM | 单页应用路由，支持首页、详情、后台等多页面体验 |
| 数据存储 | localStorage | 纯前端唯一可用的持久化方案，零配置 |
| 部署 | GitHub Pages | 免费静态站点托管，与 Git 仓库天然集成 |

### 3.2 目录结构

```
招标投标网站/
├── public/
│   └── _redirects            # GitHub Pages SPA 路由兜底（如需要）
├── src/
│   ├── components/           # 可复用组件
│   │   ├── Layout.jsx        # 整体布局（导航栏、页脚）
│   │   ├── TenderCard.jsx    # 招标项目卡片
│   │   ├── TenderForm.jsx    # 招标发布/编辑表单
│   │   ├── BidForm.jsx       # 投标提交表单
│   │   ├── TenderList.jsx    # 招标列表（含搜索/筛选）
│   │   └── StatusBadge.jsx   # 状态标签组件
│   ├── pages/                # 页面组件
│   │   ├── HomePage.jsx      # 首页：招标列表 + 搜索
│   │   ├── TenderDetailPage.jsx  # 招标详情
│   │   ├── LoginPage.jsx     # 登录
│   │   ├── RegisterPage.jsx  # 注册
│   │   ├── PublishPage.jsx   # 发布招标
│   │   ├── BidPage.jsx       # 提交投标
│   │   ├── OwnerDashboard.jsx    # 招标方后台
│   │   └── BidderDashboard.jsx   # 投标方后台
│   ├── hooks/                # 自定义 Hooks
│   │   ├── useAuth.js        # 当前登录用户状态
│   │   ├── useTenders.js     # 招标数据操作
│   │   └── useBids.js        # 投标数据操作
│   ├── services/             # localStorage 数据服务
│   │   ├── storage.js        # localStorage 封装
│   │   ├── tenderService.js  # 招标相关 CRUD
│   │   └── bidService.js     # 投标相关 CRUD
│   ├── utils/                # 工具函数
│   │   ├── constants.js      # 分类、状态常量
│   │   └── helpers.js        # 日期、格式化等
│   ├── App.jsx               # 路由配置
│   └── main.jsx              # 入口
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

### 3.3 功能模块详细设计

#### 模块 A：用户系统

- 注册时选择角色：招标方（owner）或投标方（bidder）。
- 登录仅校验用户名/密码是否匹配 localStorage 中的记录。
- 登录后把用户信息写入 `currentUser`，全局可访问。
- 未登录用户只能访问首页和详情页。

涉及文件：
- `src/pages/RegisterPage.jsx`：注册页面。
- `src/pages/LoginPage.jsx`：登录页面。
- `src/services/storage.js`：`users` 表操作。
- `src/hooks/useAuth.js`：读取和监听当前登录状态。

#### 模块 B：招标项目

- 招标方登录后可发布招标，字段包括：
  - 标题
  - 分类（工程、货物、服务、IT 等）
  - 预算金额
  - 项目描述
  - 截止时间
  - 联系人/联系方式
- 首页以卡片列表展示所有招标项目。
- 支持按分类筛选、按标题关键词搜索。
- 状态自动计算：
  - 截止时间前为“招标中”
  - 截止后未开标为“已截止”
  - 已选择中标为“已开标”

涉及文件：
- `src/pages/HomePage.jsx`：列表、搜索、筛选。
- `src/pages/TenderDetailPage.jsx`：详情展示。
- `src/pages/PublishPage.jsx`：发布招标。
- `src/components/TenderCard.jsx`：项目卡片。
- `src/components/TenderForm.jsx`：表单组件。
- `src/services/tenderService.js`：`tenders` 表操作。
- `src/hooks/useTenders.js`：数据 Hook。

#### 模块 C：投标

- 投标方在招标详情页点击“我要投标”进入投标页。
- 提交字段：
  - 投标报价
  - 投标方公司名称
  - 联系人
  - 联系电话
  - 资质说明/方案简述
- 一个投标方对同一个项目只能投一次。
- 投标截止后禁止新增投标。

涉及文件：
- `src/pages/BidPage.jsx`：投标页面。
- `src/components/BidForm.jsx`：投标表单。
- `src/services/bidService.js`：`bids` 表操作。
- `src/hooks/useBids.js`：数据 Hook。

#### 模块 D：招标方后台

- 展示“我发布的招标”列表。
- 每个项目可查看收到的投标列表。
- 招标方可选择其中一个投标作为中标方。
- 已开标的项目展示中标方信息。

涉及文件：
- `src/pages/OwnerDashboard.jsx`：招标方后台。

#### 模块 E：投标方后台

- 展示“我投过的标”列表。
- 每个投标显示对应项目名称、投标状态（待开标/中标/未中标）。

涉及文件：
- `src/pages/BidderDashboard.jsx`：投标方后台。

#### 模块 F：路由与布局

- 公共路由：首页、详情、登录、注册。
- 受保护路由：发布、投标、招标方后台、投标方后台。
- 根据角色动态显示导航入口。

涉及文件：
- `src/App.jsx`：路由表与权限守卫。
- `src/components/Layout.jsx`：导航与页脚。

#### 模块 G：GitHub Pages 部署

- 配置 `vite.config.js` 的 `base` 路径为仓库名（如 `/招标投标网站`）。
- 使用 `gh-pages` 包一键推送 `dist` 目录到 `gh-pages` 分支。
- 编写 README 说明本地运行和部署命令。

涉及文件：
- `vite.config.js`
- `package.json`（新增 `deploy` 脚本）
- `README.md`

## 4. Assumptions & Decisions

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 数据持久化 | localStorage | GitHub Pages 无法运行后端服务 |
| 用户认证 | 本地用户名/密码 | 无后端无法做真实安全认证，适合练手 |
| 部署平台 | GitHub Pages | 用户明确要求，免费 |
| 框架 | React + Vite | 生态成熟，构建产物纯静态 |
| 样式 | Tailwind CSS | 快速开发，减少自定义 CSS |
| 角色 | 招标方/投标方 | 覆盖核心双边市场逻辑 |
| 初始数据 | 预置 3-5 条示例招标 | 打开页面即可看到效果 |
| 不支持 | 文件上传、在线支付、电子签章 | 超出纯前端能力范围 |

## 5. Verification Steps

1. 本地运行 `npm run dev`，验证首页能正确显示示例招标列表。
2. 注册招标方和投标方两个账号，分别登录，验证角色区分正确。
3. 招标方发布一个新招标，验证列表中立即出现。
4. 投标方对该项目提交投标，验证投标方后台出现记录。
5. 招标方在后台看到该投标并选择中标，验证项目状态变为“已开标”。
6. 投标方后台显示“中标”状态。
7. 运行 `npm run build` 无错误，生成 `dist` 目录。
8. 运行 `npm run deploy`，部署到 GitHub Pages 后可正常访问。
9. 部署后刷新各页面，验证路由正常工作。

## 6. Implementation Order

1. 初始化 Vite + React 项目，安装 Tailwind CSS 和 React Router。
2. 搭建 `Layout`、`storage` 基础与常量。
3. 实现用户注册/登录/退出。
4. 实现招标项目 CRUD 与首页列表/搜索/筛选。
5. 实现招标详情页。
6. 实现投标提交与校验。
7. 实现招标方后台与选择中标。
8. 实现投标方后台。
9. 预置示例数据。
10. 配置 GitHub Pages 部署脚本并测试构建。
