# Agent Project Rules
# AI 协作项目规则

Read this file before changing code in this template.
修改本模板代码前先阅读本文件。

These rules are part of the template and should be preserved when creating new projects from it.
这些规则属于模板的一部分，基于模板创建新项目时应保留。

## Package manager
## 依赖管理

Use pnpm for dependency installation, scripts, tests, builds and lint checks.
依赖安装、脚本运行、测试、构建和 lint 检查统一使用 pnpm。

Do not ask which package manager should be used during setup; pnpm is fixed.
初始化时不要询问包管理器；pnpm 是固定规则。

Keep `pnpm-lock.yaml` as the only package lock file.
只保留 `pnpm-lock.yaml` 作为依赖锁文件。

Do not create or commit `package-lock.json` or `yarn.lock`.
不要创建或提交 `package-lock.json` 或 `yarn.lock`。

Keep the package-manager guard enabled so npm and yarn fail fast.
保留包管理器校验脚本，让 npm 和 yarn 尽早失败。

Keep the template package name fixed as `@jcy/template-react`.
模板包名固定为 `@jcy/template-react`。

Do not ask for or rewrite the package name during real project setup.
真实项目初始化时不要询问或改写包名。

## New project setup
## 新项目初始化

Before developing a real project from this template, read `PROJECT_SETUP.md` and complete the setup checklist with the developer.
基于本模板开发真实项目前，先阅读 `PROJECT_SETUP.md` 并与开发者完成初始化清单。

After setup, follow `PROJECT_WORKFLOW.md` to decide the next development step instead of guessing from template defaults.
初始化后，按 `PROJECT_WORKFLOW.md` 判断下一步开发内容，不要根据模板默认值猜测。

After setup is complete, send next-step guidance in the same message and do not stop at a completion summary.
初始化完成后，必须在同一条消息里给出下一步引导，不要停在完成总结。

The next-step guidance must follow the fixed post-setup development sequence from `PROJECT_WORKFLOW.md`.
下一步引导必须按 `PROJECT_WORKFLOW.md` 中的固定后续开发顺序执行。

Do not enter the next step until the current step is complete.
当前步骤未完成前，不进入下一步。

The fixed post-setup development sequence is: 1) static pages, 2) backend API Markdown documentation and centralized request method setup, 3) Node or contract Markdown documentation and DApp contract wrapper plus env contract address setup, 4) feature logic integration after asking for `.env.development` `VITE_BASE_URL` and `VITE_RPC_URL`, 5) pre-build animations, i18n language unlock and static page copy translation.
固定后续开发顺序为：1）静态页面，2）索要后端接口 Markdown 文档并集中配置请求方法，3）索要 Node 或合约 Markdown 文档并配置 DApp 合约封装与 env 合约地址，4）询问 `.env.development` 的 `VITE_BASE_URL` 和 `VITE_RPC_URL` 后对接功能逻辑，5）打包前处理动画、多语言解开和静态页面文案翻译。

Step 3 is the only skippable step. If contract documentation is not ready but API documentation is ready, record the skipped contract step in `PROJECT_SETUP_STATUS.md`, continue to Step 4 with API-backed logic, and leave contract-backed logic as TODO until the contract document is provided.
第 3 步是唯一可跳过步骤。如果合约文档暂未就绪但接口文档已就绪，则把跳过的合约步骤记录到 `PROJECT_SETUP_STATUS.md`，继续第 4 步先对接接口驱动逻辑，合约驱动逻辑保留 TODO，等合约文档补齐后再做。

Theme SCSS setup should be handled automatically during designed page implementation.
主题 SCSS 配置应在页面实现时自动抽取公共颜色。

Do not ask the developer to confirm colors one by one or run a separate color setup step.
不要让开发者一个颜色一个颜色确认，也不要单独走一轮颜色配置步骤。

If no design reference exists yet, keep the template defaults and defer shared color extraction until page implementation.
如果暂无设计参考，先保留模板默认值，等页面实现时再抽取公共颜色。

During page implementation, automatically reuse existing tokens or promote brand colors, global backgrounds, shared card or box colors, common text colors, common status colors and repeated page or component colors to `src/styles/color.scss`.
页面实现时自动抽取公共颜色：先复用已有 token；品牌色、全局背景、共享卡片或盒子色、通用文字色、通用状态色，以及多个页面或组件重复出现的颜色，应自动提升到 `src/styles/color.scss`。

Keep decorative gradients, one-off glow colors and page-specific artwork colors in page SCSS.
装饰渐变、一次性光效颜色和页面专属切图配色留在页面私有 SCSS。

Only ask the developer when the decision changes the project-wide theme direction, such as replacing the main brand color, switching the whole project between dark and light visual systems, or resolving a real design contradiction.
只有当判断会改变全项目主题方向时才询问开发者，例如替换项目主品牌色、整体暗色/亮色体系切换，或设计稿本身出现明显冲突。

Ask project-specific unknowns one setup item at a time. The default setup pack is the only grouped setup question.
项目特有且未知的配置一次只问一项。默认配置包是唯一可以合并询问的初始化问题。

The default setup pack may include route base `/h5/`, home route `/home`, layout menu `sidebar`, login mode `dapp`, i18n enabled with development `zh-Hans` and production `en`, BSC production chain and the standard DApp write defaults.
默认配置包可以包含部署目录 `/h5/`、首页 `/home`、布局菜单 `sidebar`、登录模式 `dapp`、启用多语言且开发环境默认 `zh-Hans`、生产环境默认 `en`、BSC 生产网络和标准 DApp 写合约默认项。

When presenting the default setup pack, include available options and short meanings for each item, not only the default values.
询问默认配置包时，必须同时列出可选项和简短含义，不能只列默认值。

At minimum, explain `sidebar` side navigation, `tabbar` bottom navigation, `dapp` wallet login, `hybrid` wallet and account login, `account` account/password login, i18n enabled or disabled, development `zh-Hans`, production `en`, BSC, other viem chain, gas check disabled by default, gas estimate disabled by default, ERC20 maximum approval by default, passed specific amount approval as an option, and token decimals such as 18 or other decimals.
至少说明 `sidebar` 侧边栏导航、`tabbar` 底部导航、`dapp` 钱包登录、`hybrid` 钱包与账号登录、`account` 账号密码登录、多语言启用或关闭、开发环境 `zh-Hans`、生产环境 `en`、BSC、other viem chain、Gas 检查默认关闭、Gas 估算默认关闭、ERC20 默认最大授权、可选按传入具体数值授权，以及 18 或其他 Token 精度含义。

If the developer replies `默认`, record the whole default setup pack as confirmed. If they provide changed fields such as `菜单 tabbar，多语言关闭`, only change those fields.
如果开发者回复 `默认`，记录整个默认配置包为已确认。如果开发者提供 `菜单 tabbar，多语言关闭` 这类修改字段，则只改这些字段。

After the template is copied into a real project, run `pnpm install`, `pnpm env:init` and `pnpm dev` before asking the first setup question.
模板复制到真实项目后，先运行 `pnpm install`、`pnpm env:init` 和 `pnpm dev`，再询问第一个初始化问题。

When the dev server is ready, report the Vite `Local` and `Network` URLs, especially the LAN address, in the same message as the default setup pack question.
开发服务启动成功后，将 Vite 输出的 `Local` 和 `Network` 访问地址，尤其是局域网地址，和默认配置包询问放在同一条消息里发给开发者。

Do not ask for the project name, project logo, Empty component icon, env values, contract addresses, social meta, page assets or other non-default setup items in the same message as the default setup pack.
不要在默认配置包同一轮里询问项目名称、项目 logo、Empty 组件图标、env 值、合约地址、社交 meta、页面切图或其他非默认初始化项。

After the default setup pack is confirmed, ask non-default setup items one at a time.
默认配置包确认后，再对非默认初始化项一次只问一项。

Ask for the project logo resource only; generate favicon from the logo and do not ask the developer for favicon.
只向开发者索要项目 logo 资源；favicon 由 logo 生成，不要再向开发者索要 favicon。

Ask whether the Empty component icon is ready only after the project logo answer has been handled.
只有项目 logo 的回答处理完后，才单独询问 Empty 组件图标是否已准备好。

If the developer has no Empty component icon yet, tell them it can be skipped during early development and record it in `PROJECT_SETUP_STATUS.md`.
如果开发者暂时没有 Empty 组件图标，告诉他前期开发可先跳过，并记录到 `PROJECT_SETUP_STATUS.md`。

If the Empty component icon is provided, run `pnpm empty:asset -- --input <empty-icon.png>`.
如果已提供 Empty 组件图标，运行 `pnpm empty:asset -- --input <empty-icon.png>`。

The Empty asset script must read the PNG width and height automatically. A 1x Figma export uses its original width. A large 2x export, usually close to 750px wide or around 500px tall, uses half width. The component writes width only and keeps height as auto.
Empty 图标脚本必须自动读取 PNG 宽高。Figma 导出的 1x 图使用原始宽度；较大的 2x 图通常接近 750px 宽或 500px 高，此时使用一半宽度。组件只写宽度，高度保持 auto。

If the developer has no project logo yet, tell them it can be skipped during early development, keep `public/brand/brand-status.json` not ready, and do not mark it ready until the real logo is replaced.
如果开发者暂时没有项目 logo，告诉他前期开发可先跳过，保持 `public/brand/brand-status.json` 为未就绪，直到替换真实 logo 后才能标记为就绪。

Production build must fail while `public/brand/brand-status.json` says the project logo is not ready.
当 `public/brand/brand-status.json` 表示项目 logo 未就绪时，生产构建必须失败。

Do not treat template defaults as confirmed project decisions.
不要把模板默认值当成项目已经确认的决策。

## Static page development
## 静态页面开发

During the current static-page stage, keep `.env.development` `VITE_STATIC_PAGE_MODE = 1`: use local page data, keep the preview signed in, and do not enable API, RPC, wallet login or uploads. Before the integration stage, explicitly turn this flag off and restore real data flows. The flag is development-only; never bypass production authentication.
当前静态页面阶段保持 `.env.development` 的 `VITE_STATIC_PAGE_MODE = 1`：页面使用本地静态数据，预览固定已登录，不启用接口、RPC、钱包登录或上传。进入联调阶段前明确关闭该开关，再恢复真实数据流程。该开关仅限开发环境，不得绕过生产鉴权。

## Project terminology
## 项目术语

Read `PROJECT_TERMS.md` before copying visible text from Figma or old project code.
从 Figma 或旧项目代码复制可见文案前，先阅读 `PROJECT_TERMS.md`。

If Figma uses a banned term, replace it with the approved term in source code.
如果 Figma 使用了禁用词，源码中必须替换为推荐术语。

Do not use `提现` in user-facing UI source; replace only this banned term with `提取`.
面向用户的 UI 源码中不要使用 `提现`；只把这个禁用词替换为 `提取`。

Do not replace valid business words such as `领取`, `赎回` or `取回` unless they are explicitly added to `PROJECT_TERMS.md` as banned terms later.
不要替换 `领取`、`赎回` 或 `取回` 这类有效业务词，除非后续它们被明确加入 `PROJECT_TERMS.md` 禁用词表。

## Production API origin
## 生产接口地址

Keep `VITE_BASE_URL` empty in `.env.production`.
`.env.production` 中的 `VITE_BASE_URL` 必须保持为空。

Production API requests must use relative `/api/...` paths against the current site origin.
生产接口请求必须使用相对 `/api/...` 路径并访问当前网站同源地址。

Do not write a production API domain into source code or production env.
不要在源码或生产环境变量中填写正式接口域名。

Keep `VITE_RPC_URL` empty in `.env.production` because production uses `DAPP_PRODUCTION_CHAIN` and does not read the local-chain RPC setting.
`.env.production` 中的 `VITE_RPC_URL` 必须保持为空，因为生产环境使用 `DAPP_PRODUCTION_CHAIN`，不会读取本地测试链 RPC 配置。

These rules do not apply to `.env.development`, which may use a LAN API URL and local-chain RPC URL during integration.
这些规则不适用于 `.env.development`，开发联调时可以填写局域网接口地址和本地测试链 RPC 地址。

## DApp contract reads
## DApp 合约读取

Do not omit `account` only because a contract call is a `view` / `pure` read.
不要只因为合约调用是 `view` / `pure` 读取就省略 `account`。

Before implementing a page or contract wrapper read, check whether the contract function has no `user`, `owner` or `account` address parameter but returns data related to the current user's assets, orders, rewards, claim eligibility or permissions.
实现页面或合约读取封装前，先检查该合约方法是否没有 `user`、`owner` 或 `account` 等地址参数，但返回值却与当前用户资产、订单、收益、领取资格或权限有关。

Also check whether the contract implementation uses `msg.sender`, or may depend on `msg.sender` for identity, permission or delegated-account context.
同时检查合约实现是否使用 `msg.sender`，或可能依赖 `msg.sender` 判断身份、权限或委托账户上下文。

If any user-context condition applies, explicitly pass the current connected wallet address, for example `readContract({ ..., account: connectedAddress })`.
如果满足任一用户上下文条件，必须显式传入当前连接钱包地址，例如 `readContract({ ..., account: connectedAddress })`。

`readDappContract` supports an optional `account`, and the business layer must pass it only when the read depends on the caller context.
`readDappContract` 支持可选 `account`，业务层只在读取依赖调用者上下文时传入。

Do not force-inject the current wallet address into every contract read.
不要把当前钱包地址强制注入所有合约读取。

Public reads such as global config, public market data, public行情 and Token metadata should keep no `account`.
全局配置、公共行情、Token 元数据等与调用者无关的公共读取应保持不传 `account`。

EIP-7702 delegated accounts need extra care: missing `account` / `from` in `eth_call` may execute under an empty-address context and revert, even when transaction simulation or wallet-side calls succeed.
EIP-7702 委托账户要特别注意：`eth_call` 缺少 `account` / `from` 时，可能以空地址上下文执行并回退，即使实际交易模拟或钱包内调用可以成功。

Every new user-context read must add regression tests covering business-layer address passing, `readDappContract` forwarding to viem `readContract`, and public reads not requiring `account`.
每次新增依赖用户上下文的读取，都必须补回归测试，覆盖业务层传入钱包地址、`readDappContract` 透传给 viem `readContract`，以及公共读取不要求传 `account`。

## Import paths
## 引入路径

Use relative imports for files in the same directory or nearby parent directories.
同目录或较近上级目录的文件可以使用相对路径。

`./`, `../` and `../../` are acceptable.
可以接受 `./`、`../` 和 `../../`。

Use the `@/` alias once an import would need three or more parent jumps.
当引入路径需要三级或更多上级跳转时，必须使用 `@/` 别名。

Do not write imports such as `../../../services/...`.
不要写 `../../../services/...` 这类引入。

Use `@/services/...`, `@/shared/...`, `@/router/...`, `@/assets/...` instead.
改用 `@/services/...`、`@/shared/...`、`@/router/...`、`@/assets/...`。

## Page modules
## 页面模块

Implement the supplied designs and explicitly requested features. An API endpoint alone does not authorize a new page, entry or business flow. Without a design, only add clearly required, undisputed supporting pages such as announcement lists and details; do not infer profile or withdrawal-history pages from the API document.
按已有设计和开发者明确要求实现功能，接口文档中存在某个接口，不代表可以新增对应页面、入口或业务流程。没有设计时，只补公告列表、公告详情这类明确存在且无争议的配套页面；不要根据接口文档自行扩展个人资料、提取记录等页面。

Treat each route page as a small module directory.
把每个路由页面当成一个小模块目录。

A normal page should start with a `PageName.tsx` file and a `PageName.scss` file.
普通页面通常从 `PageName.tsx` 和 `PageName.scss` 两个文件开始。

Keep same-directory page helpers next to the page and import them with `./`.
页面同目录辅助逻辑放在页面旁边，并使用 `./` 引入。

Use optional files only when the page needs them, such as `types.ts`, `utils.ts`, `service.ts` or `components/`.
仅在页面需要时增加 `types.ts`、`utils.ts`、`service.ts` 或 `components/` 等可选文件。

## Figma page implementation workflow
## Figma 页面生成流程

### Disco fixed shared UI
### Disco 已固定的公共界面

The developer has confirmed the current shared UI as the project baseline. Later Figma links, screenshots and mockups guide business-page content only; differences in a reference do not authorize changing this baseline. This project-specific rule takes precedence over the generic content-adaptation guidance below.
开发者已确认当前公共界面为项目固定基线。后续 Figma 链接、截图和效果图仅用于实现业务页面内容，参考图中的差异不代表允许修改此基线。本项目规则优先于下方通用的内容级适配规则。

- Keep the current Header layout, dimensions, left menu button, wordmark without app-name text, and wallet-status treatment.
- 保持当前 Header 的布局、尺寸、位于 Logo 左侧的菜单按钮、无名称文案的横版 Logo 及钱包状态展示。
- Keep the left-opening sidebar, its matching wordmark, and the seven menu entries in their confirmed order: 首页、预约记录、购买激活卡、我的激活卡、我的资产、团队、邀请好友. Preserve the supplied full-color icons and their first-level routes/directories.
- 保持从左侧弹出的侧边栏及与 Header 一致的品牌区，保持七个菜单的顺序：首页、预约记录、购买激活卡、我的激活卡、我的资产、团队、邀请好友；保留已提供的彩色图标及对应一级路由、目录。
- Keep the original single-icon language switch and its interaction. Do not adopt a reference's language text, arrow or capsule.
- 多语言开关保持原单图标样式与交互，不随参考图改成文字、箭头或胶囊控件。
- Keep the confirmed light theme, page background, default text and primary-button gradient, white text and inset glow. New page buttons reuse the existing skin and may set their own size, padding and radius through the mixins; do not change shared defaults to match one page.
- 保持已确认的亮色主题、页面背景、默认文字及主按钮渐变、白字、内发光。新业务按钮复用现有皮肤，可通过 mixin 设置自身大小、内边距和圆角，不为单个页面改公共默认值。

Change a fixed item only when the developer explicitly requests that item to change. Do not automatically replace its assets, text, order, colors, sizes, style or interactions to match a later reference, and do not repeatedly ask about reference-only differences. Continue with the business content while retaining the baseline.
只有开发者明确要求修改对应固定项时才调整。不要为了贴合后续参考图，自动替换其资源、文案、顺序、颜色、尺寸、样式或交互；也不要仅因参考图不同而反复询问，保留当前基线并继续实现业务内容。

Before implementing a page from a Figma link, do not write code immediately.
根据 Figma 链接开发页面前，不要直接开始写代码。

First inspect the design and the current project, then provide an implementation checklist for developer confirmation.
先分析设计稿和当前项目，再输出实现清单给开发者确认。

Before implementing a designed page, ask the developer to manually export the page assets first whenever possible.
开发设计稿页面前，尽量先让开发者手动导出该页面需要的切图资源。

Figma export and slicing choices are very flexible, so AI should not guess the best asset combination or silently download arbitrary slices.
Figma 的切图和导出组合太自由，AI 不应猜测最合适的切图组合，也不要静默下载随意切片。

AI should list the required semantic asset names and target paths, then wait for the exported assets before writing the page.
AI 应先列出需要的语义化资源名和目标路径，等切图资源准备好后再写页面。

Shared module overall layout and interaction contracts must stay stable regardless of the page design, unless there is explicit manual developer intervention.
不管项目设计稿看起来怎样，公共模块的整体布局和交互契约都必须保持稳定，除非有开发者人工手动介入并明确要求修改。

For shared modules outside Disco's fixed baseline, use content-level adaptation by default: replace resources, update text configuration, hide or show app name, reorder controls inside an existing slot, or adjust project settings. The fixed modules above require an explicit developer request even for content-level changes.
对于 Disco 固定基线之外的公共模块，默认做内容级适配：替换资源、更新文案配置、隐藏或显示 appname、在已有插槽内调整内容顺序，或调整项目设置。上方已固定模块即使是内容级改动，也必须有开发者的明确修改要求。

Do not rebuild a shared header structure just because Figma shows a single left image instead of logo plus app name, a gradient wallet button, or a different icon arrangement.
不要因为 Figma 顶部展示的是单独左侧图片而不是 logo 加 appname、渐变钱包按钮或不同图标排列，就重建公共 header 结构。

For an unfixed shared module, if its overall layout can match the design through content-level adaptation or an existing button visual variant, do that without asking. Do not apply this permission to Disco's fixed Header or other fixed modules.
对于尚未固定的公共模块，如果整体布局不变，通过内容级适配或已有按钮视觉变体就能贴近设计稿，应直接这样做，不需要询问。此授权不适用于 Disco 已固定的 Header 或其他固定模块。

For an unfixed shared module, if a design truly needs a one-off header or navigation area, pause and ask whether to create a page-specific component instead of changing the shared module. Preserve Disco's fixed modules when a reference alone differs.
对于尚未固定的公共模块，如果设计确实需要一次性的顶部或导航区域，应暂停并询问是否创建页面专属组件，而不是改公共模块。如果仅是参考图与 Disco 已固定模块不同，则直接保持固定模块。

Treat mobile status bar, carrier, battery, time and other device chrome in Figma frames as design-frame annotations, not H5 page content.
Figma 画板里的手机信息状态栏、运营商、电量、时间等设备外壳信息属于设计稿标注，不属于 H5 页面内容。

Do not implement device chrome in HTML, reserve layout height for it, or export it as a page asset unless the developer explicitly says it is real in-page artwork.
不要把设备外壳信息写进 HTML、为它预留布局高度，或把它当页面切图导出，除非开发者明确说明它是真实页面内的装饰图。

The checklist must include required exported assets, semantic UI elements, reusable components, reusable style classes, reusable mixins and page-specific exceptions.
清单必须包含所需切图资源、语义化 UI 元素、可复用组件、可复用样式类、可复用 mixin 以及页面特例。

Check existing components, `src/styles`, `src/styles/mixins.scss`, showcase pages and nearby page implementations before adding new page SCSS.
新增页面私有 SCSS 前，先检查已有组件、`src/styles`、`src/styles/mixins.scss`、演示页面和相近页面实现。

Map visual controls to semantic elements before styling them: inputs use `input` or `textarea`, actions use `button`, links use route/navigation helpers, and progress uses shared progress components when available.
样式实现前先确认控件语义：输入区使用 `input` 或 `textarea`，操作使用 `button`，跳转使用路由/导航封装，进度展示优先使用已有进度组件。

Static pages still implement basic local interactions when the design includes interactive controls, such as tab switching, inputs, expand-collapse areas, popups and copy buttons.
静态页面如果设计里包含交互控件，仍应实现基础本地交互，例如 tab 切换、输入框、展开收起、弹窗开关和复制按钮。

If the checklist is incomplete or required assets are missing, pause and report the gap instead of filling it with improvised CSS or placeholder markup.
如果清单不完整或必需资源缺失，应暂停并报告缺口，不要用临时 CSS 或占位结构硬补。

## Page data refresh
## 页面数据刷新

Authenticated business routes are wrapped by `PagePullRefresh`; splash, login and other flow pages must not be wrapped.
已登录业务路由由 `PagePullRefresh` 包裹；开屏页、登录页和其他流程页不能包裹下拉刷新。

Pages that support pull refresh must register a real refresh function with `usePageRefresh()`.
支持下拉刷新的页面必须通过 `usePageRefresh()` 注册真实刷新函数。

The refresh function must return or await the actual page data loading work, such as API requests, contract reads, list reloads or timer-driven screen refreshes.
刷新函数必须返回或等待真实页面数据加载，例如接口请求、合约读取、列表重载或定时整屏刷新。

Do not use a refresh handler that only increments a version value while the refresh component cannot know when data has actually finished loading.
不要只在刷新函数里递增版本号却让刷新组件无法知道真实数据何时完成。

Disable `usePageRefresh()` while the page is submitting, writing a contract or otherwise unable to safely refresh.
页面提交中、写合约中或其他不适合刷新时，应临时禁用 `usePageRefresh()`。

After API or contract integration, use `useLatestRequest()` or `AbortController` to prevent stale async requests from writing old data back into the page.
接口或合约联调后，使用 `useLatestRequest()` 或 `AbortController` 防止旧异步请求把旧数据回写到页面。

When a page has timers, manual pull refresh and post-write refresh should reuse the same screen refresh function and guard timer restart with mounted or lifecycle tokens.
页面存在定时器时，手动下拉刷新和写入成功后的刷新应复用同一个整屏刷新函数，并用 mounted 或生命周期 token 防止离页后旧异步重启定时器。

## Runtime and deployment
## 运行环境与部署

Use Node.js 24.11.1 or later and the pnpm version declared in package.json. Creator and project engines must agree.
使用 Node.js 24.11.1 或更新版本及 package.json 声明的 pnpm 版本；创建器和项目 engines 必须一致。

Edit the deployment prefix only in `src/config/deployment.ts`; Vite, app config and navigation derive from it. Root and nested deployments are supported.
部署目录仅修改 `src/config/deployment.ts`；Vite、应用配置和导航由它派生，支持根目录和嵌套目录部署。

## Auth startup
## 认证启动

Splash animation is the shared startup gate. If startup logic runs while the browser path is splash or referral, wait for `waitForSplashAnimation()` before authentication recovery or login branching.
开屏动画是统一启动门槛。如果启动逻辑运行时浏览器路径仍是开屏页或邀请页，认证恢复或登录分流前必须等待 `waitForSplashAnimation()`。

In DApp login modes, an existing token must validate and resume the current wallet account before authenticated APIs such as `/api/users/my` are requested.
在 DApp 登录模式中，已有 Token 必须先校验并恢复当前钱包账号，再请求 `/api/users/my` 等鉴权接口。

If the cached token and wallet address belong to a different current wallet account during splash startup, clear the stale auth session and immediately start DApp login again in the same startup flow.
开屏启动时如果缓存 Token 与钱包地址属于旧账号，应清理旧登录态，并在同一轮启动流程中立即重新发起 DApp 登录。

Business routes must wait for isSessionReady before mounting. Never send page-owned authenticated requests before wallet restoration finishes. Late responses from an old session must not clear a newer session.
业务路由挂载前必须等待 isSessionReady；钱包恢复结束前不得发送页面鉴权请求。旧会话迟到的响应不得清除新会话。

Use `clearAuthSession()` when stale auth state must be cleared without forcing a route replacement; use `logout()` when the user should be redirected to splash.
需要清理旧登录态但不强制替换路由时使用 `clearAuthSession()`；需要用户回到开屏页时使用 `logout()`。

## History route fallback
## history 路由 fallback

Use `AppBrowserRouter` instead of a strict `BrowserRouter basename="/h5"`.
使用 `AppBrowserRouter`，不要使用严格的 `BrowserRouter basename="/h5"`。

The router must accept browser URLs both with and without the `/h5` prefix because some H5 servers return the same entry HTML for `/`, `/ref/...` and `/h5/...` without HTTP redirects.
路由必须同时兼容带 `/h5` 和不带 `/h5` 的浏览器地址，因为部分 H5 服务端会把 `/`、`/ref/...` 和 `/h5/...` 都直接返回同一份入口 HTML，而不做 HTTP 重定向。

Keep internal route paths prefix-free and let navigation helpers or `AppBrowserRouter` add the browser base path.
内部路由路径保持不带前缀，由导航辅助方法或 `AppBrowserRouter` 负责补浏览器基础路径。

## Styles
## 样式

Use SCSS for page styles.
页面样式使用 SCSS。

React has no Vue-style `scoped`, so page styles should start from a page-level class prefix.
React 没有 Vue 的 `scoped`，页面样式应从页面级类名前缀开始。

Prefer names like `.splash-page`, `.home-page` and nested element classes under them.
优先使用 `.splash-page`、`.home-page` 这类页面根类名，并在其下编写子元素类名。

Reuse existing global utility classes from `src/styles` before writing new page CSS.
编写新的页面 CSS 前，优先复用 `src/styles` 中已有的全局工具类。

If a visual result can be built by combining existing utility classes, compose those classes in `className` instead of adding a custom selector.
如果某个视觉效果可以通过组合已有通用类实现，就在 `className` 中组合这些类，不要额外新增自定义选择器。

If a style already exists as a utility class, put that class directly in `className`.
如果某个样式已经有对应工具类，直接把该类写到 `className` 中。

Do not duplicate utility styles in page or component SCSS.
不要在页面或组件 SCSS 中重复编写已有工具类的等价样式。

Only write custom SCSS for styles that are genuinely page-specific or hard to express with utilities, such as special positioning, unusual shapes, complex backgrounds, state selectors, animations or component internals.
只有确实属于页面特有、或很难用通用类表达的样式才写自定义 SCSS，例如特殊定位、特殊形状、复杂背景、状态选择器、动画或组件内部结构。

For example, use `className="flex items-center justify-center tc size-24"` instead of rewriting the same flex, alignment, text-align or font-size CSS.
例如，使用 `className="flex items-center justify-center tc size-24"`，不要重复编写同等的 flex、对齐、文本居中或字号 CSS。

When style checks are needed, use `pnpm stylelint` and `pnpm lint:tsx-styles`; `pnpm lint` includes both checks alongside Oxlint. Choose checks according to the Verification section below.
需要样式检查时，使用 `pnpm stylelint` 和 `pnpm lint:tsx-styles`；`pnpm lint` 会同时执行它们及 Oxlint。按下方“验证”规范选择必要检查。

JSX `style` attributes are forbidden. Express visual states through classes; do not bypass PostCSS viewport conversion with inline React styles.
禁止 JSX `style` 属性。视觉状态通过类名表达，不要用 React 内联样式绕过 PostCSS 视口转换。

Every private SCSS declaration using vh/vw must be immediately followed by the matching dvh/dvw declaration. TSX viewport strings must also include matching dynamic units.
私有 SCSS 中使用 vh/vw 的声明必须紧接相同属性、表达式的 dvh/dvw 声明；TSX 视口字符串也必须有对应动态单位。

Custom rules apply only to first-party source. Exclude node_modules, src/vendor and src/third-party; project-written wrappers remain first-party.
自定义规则只约束一方源码；排除 node_modules、src/vendor 和 src/third-party，项目自行编写的封装仍是一方代码。

Primary action buttons use `full-btn` / `full-button` or `auto-btn` / `auto-button`. Their skin is controlled by `--app-btn-bg` and `--app-btn-color`; solid, gradient and gradient-border skin classes are optional. Header wallet controls and other scene-specific controls do not inherit the primary skin automatically.
主操作按钮使用 `full-btn` / `full-button` 或 `auto-btn` / `auto-button`，皮肤由 `--app-btn-bg` 与 `--app-btn-color` 控制；可选纯色、渐变、渐变描边皮肤。Header 钱包等场景控件不自动继承主操作皮肤。

`full-button()` and `auto-button()` must share `button-skin()` for the primary gradient, white text and inset glow. Maintain `--app-btn-bg`, `--app-btn-color`, `--app-btn-shadow` and the gradient endpoint tokens in `src/styles/color.scss`; business pages must not duplicate these skin declarations. New primary-button variants override only geometry such as size, radius and padding. Existing special structures may explicitly use `button-skin()` or `btn-primary` without changing their layout or interaction contracts, including Header controls when this skin is required.
`full-button()` 与 `auto-button()` 必须通过 `button-skin()` 复用统一的主按钮渐变、白字与内发光。`--app-btn-bg`、`--app-btn-color`、`--app-btn-shadow` 及渐变端点 token 统一在 `src/styles/color.scss` 维护，业务页面不要重复编写这些皮肤声明。后续主按钮变体只覆盖大小、圆角、内边距等几何尺寸。已有特殊结构可以显式使用 `button-skin()` 或 `btn-primary`，但须保持原有布局与交互契约；Header 控件需要此皮肤时也遵守此规则。

## Contract write feedback
## 合约写入反馈

Every contract-write workflow must render ContractLoading for its complete pending lifetime, including gas checks, allowance reads, wallet confirmation, sequential approvals and the final receipt. Use `runDappContractWorkflow()` around the entire feature action; the App host renders ContractLoading from the shared pending state.
所有写合约流程必须在完整等待期间展示 ContractLoading，覆盖 Gas 检查、授权额度读取、钱包确认、连续授权与最终回执。使用 `runDappContractWorkflow()` 包裹完整功能操作；App 中统一的宿主按共享等待状态渲染 ContractLoading。

A disabled button or local spinner may supplement but cannot replace ContractLoading. After success, await `waitForDappContractDataSync()` before refreshing chain-indexed APIs; the delay comes only from DAPP_CONFIG.contractWriteRefreshDelayMs.
禁用按钮或局部 spinner 可以补充但不能替代 ContractLoading。成功后刷新链上索引接口前必须 await `waitForDappContractDataSync()`；延迟仅由 DAPP_CONFIG.contractWriteRefreshDelayMs 控制。

Project contract wrappers must explicitly map supported UI actions and backend signatures to contract methods. An ABI method name alone must not enable an asset action.
业务合约封装必须明确映射可用的 UI 动作、后端签名与写链方法；不能仅凭 ABI 方法名称开放资产操作。

## Reuse review
## 复用复盘

After a static-page or integration milestone, review repeated structures. Extract components only when semantics match across unrelated pages, business logic is light and appearance can use tokens. Keep one-off artwork and business data orchestration local.
静态页或联调阶段完成后复盘重复结构。仅在不同页面语义一致、业务逻辑轻且视觉可用 token 配置时抽公共组件；一次性切图和业务数据编排留在页面内。

Use semantic page names such as home, user, asset, swap, team and order as suggestions. The configured home route may change; navigation and tests must read APP_CONFIG.homeRouteName. Sidebar remains full-height.
页面命名推荐 home、user、asset、swap、team、order 等语义词；首页路由可配置，跳转和测试必须读取 APP_CONFIG.homeRouteName。Sidebar 保持全屏高度。

Keep tutorial material and cross-module conventions in Markdown. Preserve only comments needed for compatibility, non-obvious boundaries or actionable TODOs in code.
教程和跨模块规范优先放 Markdown；源码仅保留兼容性、非显然边界或可执行 TODO 所需注释。

## Editor tools
## 编辑器工具

VS Code users should install `IntelliSense for CSS class names in HTML` by `Zignd`.
VS Code 用户建议安装 `Zignd` 的 `IntelliSense for CSS class names in HTML`。

This extension provides class name suggestions in `className`, including SCSS utility classes from `src/styles`.
这个插件用于在 `className` 中提示样式类名，包括 `src/styles` 中的 SCSS 工具类。

If suggestions do not appear, make sure the extension is enabled globally and run `Cache CSS class definitions`.
如果没有提示，确认插件已全局启用，然后执行 `Cache CSS class definitions`。

## Assets
## 资源

Use semantic asset names instead of numeric names.
资源命名使用语义化名称，不使用数字名称。

Good examples are `splash-logo.png`, `token-usdt.png` and `home-banner.png`.
推荐示例：`splash-logo.png`、`token-usdt.png`、`home-banner.png`。

Use SVG for clean icons and vector graphics when available.
干净的图标和矢量图优先使用 SVG。

Use PNG or WebP for complex raster images, screenshots, glow effects and exported design slices.
复杂位图、截图、发光效果和设计稿切图使用 PNG 或 WebP。

Before implementing a designed page, confirm that required exported page assets are already available in the project.
开发设计稿页面前，先确认页面所需切图资源已经放入项目。

Prefer human-exported Figma slices for complex images, decorative frames, glow effects, page backgrounds and non-trivial icons.
复杂图片、装饰边框、光效、页面背景和非常规图标优先使用人工从 Figma 导出的切图。

Decorative design slices do not require `alt`; do not treat missing `alt` on page artwork as a blocking issue.
装饰性设计切图不强制要求编写 `alt`；不要把页面视觉图缺少 `alt` 当作阻塞问题。

Do not replace missing designed assets with CSS drawings, text, emoji or temporary symbols unless the developer explicitly asks for a placeholder prototype.
缺少设计资源时，不要擅自用 CSS 绘制、文字、表情或临时符号顶替，除非开发者明确要求先做占位原型。

If required assets are missing, pause page implementation and list the missing semantic asset names and suggested target paths.
如果必需资源缺失，应暂停页面实现，并列出缺少的语义化资源名和建议放置路径。

Place page-specific assets under `src/assets/<page-name>/`; keep initialization brand assets under `public/brand/`.
页面专属资源放在 `src/assets/<page-name>/`；初始化品牌资源继续放在 `public/brand/`。

## Verification
## 验证

Page visual and interaction acceptance belongs to the developer. Unless the developer explicitly requests it, AI must not open the browser, take screenshots or recordings, compare page visuals, or perform interaction walkthroughs for acceptance.
页面视觉和交互验收由开发者负责。除非开发者明确要求，AI 不主动打开浏览器、截图或录屏、比对页面视觉效果，也不进行交互巡检验收。

AI performs only the code checks necessary for the change. Local copy, color, size and spacing adjustments need a source review; do not automatically run the full test suite, lint and build for every presentation adjustment. For logic or shared behavior changes, run relevant lint, type checks or tests according to the affected paths.
AI 仅做与改动相匹配的必要代码检查。局部文案、颜色、尺寸和间距调整检查源码即可，不要每次展示微调都默认执行全量测试、lint 和构建。涉及逻辑或公共行为的改动，按影响范围运行相关 lint、类型检查或测试。

After code changes and necessary checks, briefly report what changed and which checks actually ran, then leave page acceptance to the developer. Do not claim that page acceptance has passed on the developer's behalf.
代码修改和必要检查完成后，简短说明改动及实际执行的检查，把页面验收交给开发者，不代替开发者宣称页面验收通过。

Run `pnpm build` when production packaging or the change's impact requires full verification. Its prebuild already runs lint and tests; do not repeat those full checks separately without a specific reason.
需要生产打包，或改动影响确实需要完整验证时，运行 `pnpm build`；其 prebuild 已包含 lint 和测试，没有具体原因不要再单独重复全量检查。

`pnpm build` is a hard quality gate: its prebuild lifecycle runs `pnpm verify`, which runs lint and tests before TypeScript and Vite can emit production assets. Do not bypass or remove this lifecycle.
`pnpm build` 是强制质量门禁：prebuild 生命周期会先运行 `pnpm verify`，由它执行 lint 和测试，全部通过后 TypeScript 和 Vite 才能生成生产产物。不得绕过或删除该生命周期。

Template maintenance files and tests must stay out of generated projects. Before distributing a changed template, run `pnpm create:verify`; it validates the final creator archive by generating and building projects with default and alternate configurations. Keep the template placeholder brand unready; verification uses its own initialized fixture brand.
模板维护代码与测试不得进入生成项目。分发前运行 `pnpm create:verify`，它从最终创建包生成项目并验证默认及可选配置的完整构建。模板占位品牌保持未就绪，验收仅为独立测试项目初始化品牌。

## Test design
## 测试设计

Test stable business behavior and module contracts, not incidental presentation values or human-maintained file ordering.
测试稳定的业务行为和模块契约，不测试偶然的展示数值或人工维护的文件排序。

For configurable settings, verify that code reads the setting and behaves consistently with its current value. Do not hard-code a chosen size, color, switch value, env field list, or env order unless it is an explicit immutable requirement.
对于可配置项，验证代码确实读取该设置且行为与当前值一致。除非用户明确要求其不可变，否则不要写死尺寸、颜色、开关值、env 字段清单或 env 排序。
