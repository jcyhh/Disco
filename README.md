# React H5 DApp Template
React 移动端 H5 DApp 模板。

This project is a learning-friendly React template for mobile-only H5 and DApp projects.
这是一个面向移动端 H5 和 DApp 项目的 React 学习模板。

The stack uses React, TypeScript, Vite, Oxlint, SCSS, PostCSS viewport conversion, React Router, Zustand, Axios and i18next.
技术栈使用 React、TypeScript、Vite、Oxlint、SCSS、PostCSS 视口转换、React Router、Zustand、Axios 和 i18next。

The template keeps most modules intentionally small so each module can be studied and replaced independently.
模板会刻意让多数模块保持较小体积，方便逐个学习和独立替换。

## Agent rules
## AI 协作规则

AI tools and collaborating engineers should read `AGENTS.md` before changing code.
AI 工具和协作工程师修改代码前应先阅读 `AGENTS.md`。

Project conventions such as import paths, page modules, styles and asset naming are recorded there.
引入路径、页面模块、样式和资源命名等项目规范都记录在其中。

Runtime: Node.js 24.11.1+ and pnpm 10.28.2. The test runner uses native TypeScript support.
运行环境：Node.js 24.11.1+、pnpm 10.28.2；测试使用 Node 原生 TypeScript 支持。

## New project setup
## 新项目初始化

Build the local create package first.
先在本机模板目录生成本地创建包。

```bash
cd /Users/jcy/React/template
git pull
pnpm create:local
```

Then create a project from the local package.
然后在新项目空目录中使用本地包创建项目。

```bash
pnpm dlx /Users/jcy/React/template/packages/create-template-react/jcy-create-template-react-0.1.0.tgz .
```

If the local package is unavailable, clone the GitHub template from `https://github.com/jcyhh/template-react.git`.
如果本地包暂不可用，则从 `https://github.com/jcyhh/template-react.git` 克隆模板。

Before using this template for a real project, read `PROJECT_SETUP.md`.
使用本模板创建真实项目前，先阅读 `PROJECT_SETUP.md`。

After setup, follow `PROJECT_WORKFLOW.md` to decide the next development step.
初始化后，按照 `PROJECT_WORKFLOW.md` 判断下一步开发该做什么。

Project-facing terms are recorded in `PROJECT_TERMS.md`.
面向项目用户的术语规范记录在 `PROJECT_TERMS.md`。

## Included template guards
## 内置模板防护

Authenticated business pages can use `PagePullRefresh` and `usePageRefresh()` for page-level pull refresh that waits for real data loading.
已登录业务页可使用 `PagePullRefresh` 和 `usePageRefresh()` 做页面级下拉刷新，并等待真实数据加载完成。

Pages can use `useLatestRequest()` to prevent old API or contract reads from writing stale data back after a newer refresh starts.
页面可使用 `useLatestRequest()`，避免旧接口或合约读取在新刷新后回写旧数据。

DApp startup validates the current wallet account before authenticated APIs run, and splash animation is shared as the startup gate.
DApp 启动会在鉴权接口执行前校验当前钱包账号，并统一把开屏动画作为启动门槛。

`AppBrowserRouter` accepts URLs with or without `/h5`, then adds `/h5` for app navigations.
`AppBrowserRouter` 兼容带 `/h5` 与不带 `/h5` 的访问路径，并在应用内跳转时补回 `/h5`。

## Development
## 开发命令

This template uses pnpm as the package manager.
本模板使用 pnpm 作为依赖管理工具。

pnpm keeps one global content-addressable store, which is friendlier when many projects are created from the same template.
pnpm 会复用全局内容寻址存储，对基于同一模板创建多个项目的场景更友好。

The project rejects npm and yarn for dependency installation and common scripts.
项目会拒绝使用 npm 和 yarn 安装依赖或运行常用脚本。

The template package name is fixed as `@jcy/template-react`.
模板包名固定为 `@jcy/template-react`。

Do not rename it during real project setup; use project config and env values for business project names.
真实项目初始化时不要改这个包名；业务项目名通过项目配置和 env 配置控制。

## Environment files
## 环境变量文件

Only `.env.example` is tracked by git.
只有 `.env.example` 会被 git 追踪。

After downloading or copying this template, create local runtime env files with the init script.
下载或复制本模板后，使用初始化脚本创建本地运行用的 env 文件。

```bash
pnpm env:init
```

The script reads `.env.example`, removes documentation comments, and creates `.env.development` and `.env.production` if they do not already exist.
脚本会读取 `.env.example`，移除说明注释，并在 `.env.development` 和 `.env.production` 不存在时创建它们。

Then fill the generated values for the current project.
然后根据当前项目填写生成后的配置值。

Keep `.env.development` and `.env.production` local only.
`.env.development` 和 `.env.production` 只保留在本地，不提交到 git。

Install dependencies before running the project.
运行项目前先安装依赖。

```bash
pnpm install
```

Start the local development server.
启动本地开发服务。

```bash
pnpm dev
```

Build the production bundle.
构建生产包。

```bash
pnpm build
```

Run the test suite.
运行测试。

```bash
pnpm test
```

Run Oxlint.
运行 Oxlint。

```bash
pnpm lint
```

## VS Code extensions
## VS Code 扩展

Install `IntelliSense for CSS class names in HTML` by `Zignd` for `className` style suggestions.
安装 `Zignd` 的 `IntelliSense for CSS class names in HTML`，用于在 `className` 中提示样式类名。

This project recommends it through `.vscode/extensions.json`.
本项目已经通过 `.vscode/extensions.json` 推荐该插件。

If the command `Cache CSS class definitions` is missing, check whether the extension is globally disabled.
如果搜不到 `Cache CSS class definitions` 命令，检查插件是否被全局禁用。

## Documentation style
## 文档风格

Module notes use English first and Chinese directly below.
模块说明采用英文在上、中文紧跟下一行的形式。

AI tools should read the English text first.
AI 工具可以优先读取英文内容。

Engineers can read the Chinese line below for the same meaning.
工程师可以阅读下方中文行来理解相同含义。

Keep tutorials and module conventions in Markdown files.
教程和模块约定应放在 Markdown 文件中。

Keep code comments focused on local reasons, TODOs and important constraints.
代码注释只解释局部原因、TODO 和重要约束。

## Mobile H5 adaptation
## 移动端 H5 适配

SCSS can be written with 750px design draft values.
SCSS 可以按照 750 设计稿直接写 px。

PostCSS converts eligible `px` values into `vw`.
PostCSS 会把符合条件的 `px` 转换成 `vw`。

When a third-party component needs real numeric pixels, use the viewport helper module.
当三方组件需要真实数字像素时，使用 viewport 辅助模块。

## Social share cards
## 社交分享卡片

Social share meta tags are disabled by default and are injected into the HTML entry only when `VITE_ENABLE_SOCIAL_META=1`.
社交分享 meta 默认关闭，只有 `VITE_ENABLE_SOCIAL_META=1` 时才会注入 HTML 入口。

Social values are configured through env variables and stay blank in the template.
社交分享值通过环境变量配置，模板中保持空值。

Fill them with public absolute URLs before a real production launch.
真实项目上线前应填写公网可访问的绝对地址。

## Template validation
## 模板验收

`pnpm lint` checks code, SCSS utility reuse, dynamic viewport pairs and TSX style boundaries. Deployment prefix has a single source in `src/config/deployment.ts`.
`pnpm lint` 检查代码、SCSS 工具类复用、动态视口配对和 TSX 样式边界。部署目录统一配置在 `src/config/deployment.ts`。

Run `pnpm create:verify` in the template repository after `pnpm install`. It validates the final creator archive with independent default and alternate projects, including frozen installation, tests, lint and production build. Maintenance tests are excluded from generated projects.
在模板仓库执行 `pnpm install` 后运行 `pnpm create:verify`，从最终创建包验收独立默认及可选配置项目的冻结安装、测试、lint 和生产构建。生成项目不包含模板维护测试。

The template retains an unready placeholder brand. A direct production build intentionally fails until a real project logo is provided; create:verify initializes its own isolated test brand without changing template assets.
模板保留未就绪的占位品牌；直接生产构建会在提供真实 Logo 前按设计失败。create:verify 仅初始化独立测试品牌，不改模板资源。

See `docs/template-feedback-status.md` for the reusable improvements and their verification status.
通用能力回灌及验证状态见 `docs/template-feedback-status.md`。
