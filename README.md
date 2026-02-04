This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 评论 (Giscus)

博客文章详情页已集成 [Giscus](https://giscus.app)（基于 GitHub Discussions 的评论）。**需先将项目推送到 GitHub** 后才能启用评论；未配置或未上传时文章页不显示评论区，其余功能正常。

启用步骤：

1. 将本仓库推送到 GitHub，在仓库设置中开启 **Discussions**，并创建一个分类（如 `Announcements`）。
2. 打开 [giscus.app](https://giscus.app/zh-CN)，按提示选择仓库与分类，获取 **Repository ID** 和 **Category ID**。
3. 在项目根目录创建 `.env.local`，填入（或复制自 `.env.example` 后修改）：

   ```
   NEXT_PUBLIC_GISCUS_REPO=你的用户名/仓库名
   NEXT_PUBLIC_GISCUS_REPO_ID=从 giscus 复制的 repo id
   NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
   NEXT_PUBLIC_GISCUS_CATEGORY_ID=从 giscus 复制的 category id
   ```

4. 重启开发服务器。未配置时评论区不渲染，配置后文章页底部会显示 Giscus 评论框。

## CI/CD 与部署 (GitHub Pages)

项目已配置 GitHub Actions：

- **CI**（`.github/workflows/ci.yml`）：每次 push / PR 到 `main` 时执行 `npm ci`、`npm run lint`、`npm run build`，用于检查代码与构建是否通过。
- **CD**（`.github/workflows/deploy.yml`）：每次 push 到 `main` 且构建成功后，将静态站点（`out`）部署到 **GitHub Pages**。

**启用 GitHub Pages：**

1. 将仓库推送到 GitHub。
2. 在仓库 **Settings → Pages** 中，**Source** 选择 **GitHub Actions**（不要选 Branch）。
3. 推送或合并到 `main` 后，Actions 会自动构建并部署；完成后站点地址为 `https://<用户名>.github.io/<仓库名>/`。

**若仓库名不是 `用户名.github.io`**（即站点在子路径下），需在 `next.config.ts` 中取消注释并修改：

- `basePath: '/<仓库名>'`
- `assetPrefix: '/<仓库名>'`

否则静态资源路径会错误。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
