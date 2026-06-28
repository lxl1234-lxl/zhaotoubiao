# 招标投标网站

一个纯前端静态的招标投标信息平台，数据保存在浏览器 localStorage 中，可部署到 GitHub Pages。

## 功能

- 招标方：注册/登录、发布招标、查看投标、选择中标
- 投标方：注册/登录、浏览招标、提交投标、查看中标结果
- 访客：浏览招标列表和详情
- 首页支持搜索、分类筛选、状态筛选

## 技术栈

- React + Vite
- Tailwind CSS
- React Router
- localStorage

## 本地运行

```bash
npm install
npm run dev
```

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库 `招标投标网站`
2. 将代码推送到仓库
3. 运行：

```bash
npm run deploy
```

4. 在仓库 Settings > Pages 中，Source 选择 `gh-pages` 分支

## 示例账号

- 招标方：`zhaobiao` / `123456`
- 投标方：`toubiao` / `123456`
