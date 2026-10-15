# Project setup status
# 项目初始化状态

## Confirmed
## 已确认

- Project name: Disco.
- 项目名称：Disco。
- Template: `jcyhh/template-react`, commit `40ba85c7830572b4dda6b8685620fd5794e04da8`.
- 模板来源：`jcyhh/template-react`，版本 `40ba85c7830572b4dda6b8685620fd5794e04da8`。
- Package manager: pnpm 10.28.2; package name remains `@jcy/template-react`.
- 包管理器：pnpm 10.28.2；包名保持 `@jcy/template-react`。
- Deployment prefix: `/h5/`; home route: `/home`.
- 部署目录：`/h5/`；首页路由：`/home`。
- Layout menu: `sidebar`, opening from the left; login mode: `dapp` (wallet login).
- 布局菜单：`sidebar` 侧边栏，从左侧弹出；登录模式：`dapp` 钱包登录。
- Menu entries and first-level directories under `src/pages/main/`: 首页 (`home/`, `ROUTE_PATH.home` derived from the home configuration), 预约记录 (`reservation/`, `/reservation`), 我的激活卡 (`activation-card/`, `/activation-card`), 我的资产 (`asset/`, `/asset`), 团队 (`team/`, `/team`) and 邀请好友 (`invite/`, `/invite`). The existing `user/` page and `/user` route remain outside the menu.
- 菜单及 `src/pages/main/` 下的一级目录：首页（`home/`，路径由首页配置推导为 `ROUTE_PATH.home`）、预约记录（`reservation/`，`/reservation`）、我的激活卡（`activation-card/`，`/activation-card`）、我的资产（`asset/`，`/asset`）、团队（`team/`，`/team`）、邀请好友（`invite/`，`/invite`）。原有 `user/` 页面及 `/user` 路由保留，不再出现在菜单中。
- Supplied menu PNGs are copied unchanged to `src/assets/layout/menu/` with semantic filenames. Icons keep their original colors without brightness filters; selected text uses the theme color. All six menu pages now have static content and local interactions, with page acceptance pending with the user.
- 用户提供的菜单 PNG 按语义命名原样复制到 `src/assets/layout/menu/`，图标保留原色、不使用亮度滤镜，选中文字使用主题色。六个菜单页面均已实现静态内容与本地交互，待用户页面验收。
- I18n: enabled; development language: `zh-Hans`; production language: `en`.
- 多语言：启用；开发环境默认简体中文 `zh-Hans`，生产环境默认英文 `en`。
- Enabled languages: Simplified Chinese, Traditional Chinese and English, as provided by the template.
- 启用语言：保留模板的简体中文、繁体中文和英文。
- Production chain: BSC (`viem/chains` `bsc`, chain ID 56).
- 生产网络：BSC（`viem/chains` 的 `bsc`，链 ID 56）。
- Contract writes: gas check disabled; gas estimate disabled; insufficient ERC20 allowance uses maximum approval; Token decimals: 18.
- 写合约策略：关闭 Gas 检查和 Gas 估算；ERC20 授权不足时使用最大授权；Token 精度为 18。
- Project logo: supplied Disco wordmark, preserved as `public/brand/disco-wordmark.png` (110x48).
- 项目 Logo：用户提供的 Disco 横版标识，原图保存在 `public/brand/disco-wordmark.png`（110x48）。
- App logo: `public/brand/app-logo.png` uses a transparent 110x110 canvas with the original wordmark centered at its original size; favicon is generated with `pnpm favicon:generate`.
- 应用 Logo：`public/brand/app-logo.png` 在 110x110 透明画布中居中放置原尺寸标识；favicon 使用 `pnpm favicon:generate` 生成。
- Empty component: retain the template placeholder, following the request to use defaults for the remaining setup items.
- Empty 组件：根据其余配置采用默认值的要求，保留模板占位图。
- Theme: light; vertical page gradient from `#F8EAFE` to `#F9F9F9`; primary color `#D11BFF`; default text black. Shared surfaces, controls and browser metadata use the light theme.
- 主题：亮色；页面由上到下从 `#F8EAFE` 渐变至 `#F9F9F9`；主题色 `#D11BFF`；默认文字为黑色。公共背景、控件和浏览器元数据已适配亮色主题。
- Shared sizing and buttons follow the [home design reference](https://www.figma.com/design/NVwAAv12WZx1LiCTqPMNWD?node-id=30934-11283), using its 750px draft: Header 88px, menu 40px, wordmark 110x48px, wallet control 56px. The language switch retains its original 52px single-icon trigger and interaction; the Figma language capsule is not applied. The wallet status uses the supplied 32x32 SVG and displays signed-in status during static preview without creating a wallet address.
- 公共尺寸和按钮参考[首页设计稿](https://www.figma.com/design/NVwAAv12WZx1LiCTqPMNWD?node-id=30934-11283)，沿用 750px 设计基准：Header 高 88px、菜单 40px、横版 Logo 110x48px、钱包控件高 56px。语言开关保留原有 52px 单图标入口与交互，不采用 Figma 胶囊样式。钱包状态使用用户提供的 32x32 SVG，静态预览显示已登录，不伪造钱包地址。
- Primary buttons use a purple gradient, white text, pill corners and an inset glow; full-width buttons default to 80px tall. Home, reservation records, activation cards, assets, team and invite have static content and local interactions awaiting user page acceptance.
- 主按钮采用紫色渐变、白字、胶囊圆角和内发光，通栏默认高 80px；首页、预约记录、我的激活卡、我的资产、团队、邀请好友静态内容及本地交互已实现，待用户页面验收。

## Static-page progress
## 静态页面进度

The home page includes the activity Banner, announcements, four quick links, exploration and Disco overview. `src/mock/home.ts` owns three same-image Banner entries, announcement text and display values. Shared `BasicCarousel` supports horizontal Banner rotation and vertical announcement rotation; announcement details use a local `Popup`. The reservation action currently navigates to reservation records without submitting business data. See [the home module notes](src/pages/main/home/README.md).
首页已实现活动 Banner、公告、四个快捷入口、参与探索和认识 Disco。`src/mock/home.ts` 集中维护三个复用同图的 Banner 条目、公告文本和展示数值；共享 `BasicCarousel` 支持 Banner 水平轮播与公告垂直轮播，公告详情使用本地 `Popup`。“立即预约”当前仅跳转预约记录，不提交业务数据。详见[首页模块说明](src/pages/main/home/README.md)。

Reservation records use local mock data from `src/mock/reservation.ts`: queued 4, active 3, selling 3 and completed 3. Card fields vary by status, and completed earnings reduction is optional. Shared USDT assets, cards and button skins are reused. `SegmentedTabs variant="pills"` supports long-text horizontal scrolling and keeps the selected tab visible; all three enabled languages are populated. Selling opens a local confirmation dialog whose confirmation only closes it, without changing order state or calling API/RPC. No fake refresh handler is registered. See [the reservation module notes](src/pages/main/reservation/README.md).
预约记录使用 `src/mock/reservation.ts` 本地数据：排队中 4 条、进行中 3 条、卖出中 3 条、已完成 3 条。卡片字段随状态变化，已完成的收益减少为可选项；复用 USDT 资源入口、卡片和按钮皮肤。`SegmentedTabs variant="pills"` 支持长文本横向滚动并让选中项可见，三种已启用语言词条均已补齐。卖出仅打开本地确认弹窗，确认后关闭，不改变订单状态、不触发 API/RPC，也不注册虚假刷新函数。详见[预约记录模块说明](src/pages/main/reservation/README.md)。

Activation cards follow Figma node `31024:3260`. Local mock cards have face values 10/20/30 and owned counts 10/2/0; records expand from 4 to 8. Gifting uses a local address, positive-integer and inventory validation form; confirmation only closes it without transactions or inventory changes, while zero inventory shows a message. The design's `转增` is standardized to `转赠`, with all three enabled languages populated. Eight Figma resources are local under `src/assets/activation-card/`; the four large images were converted to WebP from 10,676,687 to 616,436 bytes, approximately 94.23% smaller. Fixed shared UI is unchanged. See [the activation-card module notes](src/pages/main/activation-card/README.md).
我的激活卡参考 Figma 节点 `31024:3260`。本地 mock 面值为 10/20/30，拥有数量为 10/2/0；记录从 4 条展开至 8 条。转赠使用本地地址、正整数和库存校验表单，确认仅关闭，不发生交易或库存变更；0 库存仅作提示。设计“转增”统一为“转赠”，三种已启用语言词条已补齐。八份 Figma 资源已下载到 `src/assets/activation-card/`，四张大图转为 WebP，从 10,676,687 bytes 降至 616,436 bytes，减少约 94.23%；固定公共 UI 保持不变。详见[我的激活卡模块说明](src/pages/main/activation-card/README.md)。

The assets page contains a local asset overview and transaction history. Withdrawal opens a local confirmation dialog; confirming only closes it, without changing balances, submitting a withdrawal or requesting API/RPC. User-facing copy follows the approved `提取` terminology. See [the assets module notes](src/pages/main/asset/README.md).
我的资产页包含本地资产预览与资产明细。提取打开本地确认弹窗，确认仅关闭，不改变余额、不提交提取、不发起 API/RPC；面向用户的文案统一使用项目批准的“提取”术语。详见[我的资产模块说明](src/pages/main/asset/README.md)。

The team page contains local team metrics and a direct-referral member list. Its copy action copies a real text URL assembled from the current origin, configured deployment prefix and mock referral code. With the current prefix the referral path is `/h5/ref/DBK6P8`; it does not request or infer real team or wallet data. See [the team module notes](src/pages/main/team/README.md).
我的团队页包含本地团队统计与直推成员列表。复制按钮会实际复制由当前站点同源地址、配置部署前缀和 mock 邀请码组成的文本链接；当前部署前缀下路径为 `/h5/ref/DBK6P8`，不请求或推断真实团队及钱包数据。详见[我的团队模块说明](src/pages/main/team/README.md)。

The invite page copies the mock referral code and link as real text. Saving a poster uses local artwork and Canvas to compose a PNG for preview and download, with local loading and failure feedback. No upload, backend poster service or business request is involved. Shared copy feedback and all new page copy are included in the three project locales. See [the invite module notes](src/pages/main/invite/README.md).
邀请好友页可实际复制 mock 邀请码与邀请链接。保存海报通过本地素材与 Canvas 合成 PNG，支持预览和下载，并提供本地生成中及失败反馈；不上传、不调用后端海报服务或业务接口。共享复制反馈及新增页面文案均已补齐三种项目语言。详见[邀请好友模块说明](src/pages/main/invite/README.md)。

Assets and team reuse `BusinessPageHero` for their page banners. Team and invite share `src/mock/referral.ts`, which owns the `DBK6P8` code and builds same-origin links with the configured deployment prefix. This reuse does not change the fixed shared UI baseline.
我的资产与我的团队的页内顶部展示复用 `BusinessPageHero`。团队与邀请好友共用 `src/mock/referral.ts`，由它维护 `DBK6P8` 邀请码及带配置部署前缀的同源链接；本次复用不改变已固定的公共界面基线。

The three new pages contain 21 local resources. Their total size is 26,258,775 bytes before optimization and 1,670,807 bytes afterward, approximately 93.64% smaller. The totals below are the sums of each page's supplied resource sizes.
本轮三个新页面共使用 21 份本地资源，按各页资源实际加和，从 26,258,775 bytes 降至 1,670,807 bytes，减少约 93.64%。

| 页面 | 资源数 | 优化前（bytes） | 优化后（bytes） | 减少 |
| --- | ---: | ---: | ---: | ---: |
| 我的资产 | 6 | 8,301,883 | 307,527 | 96.30% |
| 我的团队 | 10 | 12,151,829 | 362,492 | 97.02% |
| 邀请好友 | 5 | 5,805,063 | 1,000,788 | 82.76% |
| 合计 | 21 | 26,258,775 | 1,670,807 | 93.64% |

Five runtime image resources were compressed from 3,715,915 to 554,184 bytes, a reduction of approximately 85.1%. Home artwork is under `src/assets/home/`, the mock Banner is under `src/mock/assets/`, and the USDT icon is shared through `src/assets/tokens/`.
五张运行时图片资源从 3,715,915 bytes 压缩至 554,184 bytes，减少约 85.1%。首页切图位于 `src/assets/home/`，mock Banner 位于 `src/mock/assets/`，USDT 图标统一通过 `src/assets/tokens/` 复用。

All six first-level menu pages have static implementations, with visual and interaction acceptance pending with the user. The static-page stage is not complete until the user accepts these pages. Development stays at Step 1; API and contract integration have not started, and static-page mode remains enabled.
六个菜单一级页面均已有静态实现，视觉和交互验收待用户进行；用户验收前，不将静态页面阶段标记为完成。项目继续处于第 1 步，尚未进入接口或合约联调，静态页面模式保持开启。

## Fixed shared UI baseline
## 已固定的公共界面基线

The developer has confirmed the current Header, left sidebar, six menu entries and their icons/routes/directories, matching wordmarks without app-name text, original single-icon language switch, light theme and primary-button skin. Later design references apply to business-page content only and must not automatically change these shared parts. Only an explicit developer request may change a fixed item. New business buttons reuse the existing skin and can vary their own size and radius without changing shared defaults.
开发者已确认当前 Header、左侧侧边栏、六个菜单及图标/路由/目录、无名称文案的统一横版 Logo、原单图标多语言开关、亮色主题与主按钮皮肤为固定基线。后续效果图仅用于业务页面内容，不自动改动这些公共部分；只有开发者明确要求修改对应项时才调整。新业务按钮复用现有皮肤，可单独调整大小和圆角，不修改公共默认值。

## Deferred integration values
## 联调阶段补充

- Static-page development is enabled locally with `VITE_STATIC_PAGE_MODE = 1`: keep the preview signed in and pause API/RPC/upload traffic. Disable it before integration. Production sets `0` and ignores this development-only feature.
- 本地已开启静态页面开发模式 `VITE_STATIC_PAGE_MODE = 1`：预览固定已登录，暂停接口、RPC 和上传请求；联调前关闭。生产环境设为 `0`，且不会启用此开发功能。

- Development API and RPC endpoints, Token addresses and business contract addresses are not configured yet. Obtain them before feature integration; do not infer production values from the template.
- 开发接口、RPC、Token 与业务合约地址尚未配置，在功能联调前补齐。
- Production `VITE_BASE_URL` and `VITE_RPC_URL` stay empty, as required by the template.
- 生产环境 `VITE_BASE_URL`、`VITE_RPC_URL` 按模板规则保持为空。
- Social sharing remains disabled. Add public metadata before enabling it for release.
- 社交分享保持默认关闭；发布时如需启用，再补齐公开元数据。
- Keep the Empty placeholder during early development; replace it when the designed empty-state resource is available.
- 开发初期保留 Empty 占位图；设计资源就绪后再替换。

## Initial setup verification record
## 初始化阶段验证记录

- `pnpm build` passed, including lint checks, all 245 tests, TypeScript compilation and the Vite production build.
- `pnpm build` 通过，包含 Lint、全部 245 项测试、TypeScript 编译与 Vite 生产构建。
- Browser preview shows the Disco title and supplied logo. A browser without a wallet shows the expected wallet-environment prompt in `dapp` mode.
- 浏览器预览已显示 Disco 标题与用户提供的 Logo；无钱包浏览器在 `dapp` 模式下正常提示使用钱包环境打开。

These records describe initial setup before static-page mode was enabled. Visual and interaction acceptance of all six current menu pages remains the user's responsibility and is pending.
以上为开启静态页面模式前的初始化验证记录。当前六个菜单页面的视觉和交互验收仍由用户负责，尚待验收。

## Next development step
## 下一步开发

Continue Step 1: let the user accept all six menu pages and address their feedback. Keep static-page mode enabled and do not declare this stage complete or advance to API or contract integration before user acceptance. Follow `PROJECT_WORKFLOW.md` for any additional designed pages and the later integration steps.
继续第 1 步：由用户验收六个菜单页面，并处理验收反馈。保持静态页面模式开启，用户验收前不宣称该阶段完成，也不推进接口或合约联调；新增设计页及后续联调仍按 `PROJECT_WORKFLOW.md` 执行。
