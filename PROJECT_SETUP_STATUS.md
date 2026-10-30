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
- Menu entries and first-level directories under `src/pages/main/`: 首页 (`home/`, `ROUTE_PATH.home` derived from the home configuration), 预约记录 (`reservation/`, `/reservation`), 购买激活卡 (`purchase-card/`, `/purchase-card`), 我的激活卡 (`activation-card/`, `/activation-card`), 我的资产 (`asset/`, `/asset`), 团队 (`team/`, `/team`) and 邀请好友 (`invite/`, `/invite`). The existing `user/` page and `/user` route remain outside the menu.
- 菜单及 `src/pages/main/` 下的一级目录：首页（`home/`，路径由首页配置推导为 `ROUTE_PATH.home`）、预约记录（`reservation/`，`/reservation`）、购买激活卡（`purchase-card/`，`/purchase-card`）、我的激活卡（`activation-card/`，`/activation-card`）、我的资产（`asset/`，`/asset`）、团队（`team/`，`/team`）、邀请好友（`invite/`，`/invite`）。原有 `user/` 页面及 `/user` 路由保留，不再出现在菜单中。
- Supplied menu PNGs are copied unchanged to `src/assets/layout/menu/` with semantic filenames. Icons keep their original colors without brightness filters; selected text uses the theme color. All seven menu pages have implemented layouts and are now using backend APIs where available; acceptance remains with the developer.
- 用户提供的菜单 PNG 按语义命名原样复制到 `src/assets/layout/menu/`，图标保留原色、不使用亮度滤镜，选中文字使用主题色。七个菜单页面已有页面实现，现进入接口联调，接口支持的部分已切换后端数据，验收由开发者负责。
- I18n: enabled; development language: `zh-Hans`; production language: `en`.
- 多语言：启用；开发环境默认简体中文 `zh-Hans`，生产环境默认英文 `en`。
- Enabled languages: Simplified Chinese, English, Korean, Japanese, Russian and Mongolian (Cyrillic), as requested by the developer.
- 启用语言：简体中文、英文、韩文、日文、俄文、西里尔蒙古文；请求头参考 AIGO，直接传 `zh-Hans` / `en` / `ko` / `ja` / `ru` / `mn`，不做地区代码转换。
- Production chain: BSC (`viem/chains` `bsc`, chain ID 56).
- 生产网络：BSC（`viem/chains` 的 `bsc`，链 ID 56）。
- Contract writes: gas check disabled; gas estimate disabled; insufficient ERC20 allowance uses maximum approval; Token decimals: 18.
- 写合约策略：关闭 Gas 检查和 Gas 估算；ERC20 授权不足时使用最大授权；Token 精度为 18。
- Project logo: supplied Disco wordmark, preserved as `public/brand/disco-wordmark.png` (110x48).
- 项目 Logo：用户提供的 Disco 横版标识，原图保存在 `public/brand/disco-wordmark.png`（110x48）。
- App logo: `public/brand/app-logo.png` uses a transparent 110x110 canvas with the original wordmark centered at its original size; favicon is generated with `pnpm favicon:generate`.
- 应用 Logo：`public/brand/app-logo.png` 在 110x110 透明画布中居中放置原尺寸标识；favicon 使用 `pnpm favicon:generate` 生成。
- Empty component: replaced with the supplied purple empty-state artwork (320×320), stored at `src/assets/common/empty.png`; developer-specified display width 160px and height auto.
- Empty 组件：已替换为用户提供的紫色缺省图（320×320），统一资源为 `src/assets/common/empty.png`，按开发者指定显示宽 160px、高度自适应。
- Theme: light; vertical page gradient from `#F8EAFE` to `#F9F9F9` over 800 design pixels below the page navigation, followed by solid `#F9F9F9`; primary color `#D11BFF`; default text black. Shared surfaces, controls and browser metadata use the light theme.
- 主题：亮色；页面从导航下方起，在 800 设计像素内由 `#F8EAFE` 渐变至 `#F9F9F9`，下面延续纯色 `#F9F9F9`；主题色 `#D11BFF`；默认文字为黑色。公共背景、控件和浏览器元数据已适配亮色主题。
- Shared sizing and buttons follow the [home design reference](https://www.figma.com/design/NVwAAv12WZx1LiCTqPMNWD?node-id=30934-11283), using its 750px draft: Header 88px, menu 40px, wordmark 110x48px, wallet control 56px. The language switch retains its original 52px single-icon trigger and interaction; the Figma language capsule is not applied. The wallet status uses the supplied 32x32 SVG and displays signed-in status during static preview without creating a wallet address.
- 公共尺寸和按钮参考[首页设计稿](https://www.figma.com/design/NVwAAv12WZx1LiCTqPMNWD?node-id=30934-11283)，沿用 750px 设计基准：Header 高 88px、菜单 40px、横版 Logo 110x48px、钱包控件高 56px。语言开关保留原有 52px 单图标入口与交互，不采用 Figma 胶囊样式。钱包状态使用用户提供的 32x32 SVG，静态预览显示已登录，不伪造钱包地址。
- Primary buttons use a purple gradient, white text, pill corners and an inset glow; full-width buttons default to 80px tall. The seven menu pages retain their confirmed visual foundation while API-backed logic is integrated.
- 主按钮采用紫色渐变、白字、胶囊圆角和内发光，通栏默认高 80px；七个菜单页面保持已确认视觉基础，当前对接接口支持的业务逻辑。

## Current stage / 当前阶段

开发者已提供接口文档、主机并明确要求进入接口对接，测试由开发者承担。补充页面仅限公告列表、公告详情等明确存在且无争议的配套内容；不根据接口文档自行扩展设计中没有的页面或入口。此授权替代先等待静态页验收的旧推进约定，不代表 AI 已验收页面。

1. 静态页面：已有七个菜单页面和公告链路，保留现有视觉基线。
2. API 文档与集中封装：已按 `docs/api/frontend-api.md` 完成，方法在 `src/features/`，上传复用共享服务。
3. 合约：已根据开发者提供的 `localhost.json` 接入，链 ID 31337，RPC 按开发者最新指定使用 `http://192.168.110.180:8545`；本地链地址在开发 env，ABI 与映射见 `docs/contracts/README.md`。
4. API 逻辑：已接入当前可用接口，等待开发者测试和反馈；预约、购卡、卖出已绑定完整签名和链上交易流程，禁止独立提交预备订单。
5. 多语言已开放六种语言并完成前端词库、静态文案与公共提示翻译，语言开关和主题保留原基线。七个一级业务页现已加入横幅、卡片、统计及列表的轻量入场动画，视口内按元素播放一次，分页新增项单独播放；支持减少动态效果、键盘即时显示和离页清理。本轮动画只运行相关类型、源码/样式及隔离回归检查，未重新打包，视觉验收由开发者负责。

## Environment / 环境

- `.env.development`：`VITE_STATIC_PAGE_MODE = 0`，`VITE_BASE_URL = http://192.168.110.11:9520`。
- 登录恢复真实钱包签名及 Token 鉴权；不再固定已登录。开发登录签署 `Login-{timestamp}`，接口为 `/api/auth/login`，邀请码字段为 `ref`。
- `.env.development` 已配置本地 RPC、USDT、DISCO、DiscoProject 地址和部署链 ID；每次写链先检查部署与钱包网络。
- `.env.production` 已按开发者 2026-10-29 提供的 `bsc (1).json` 更新 BSC（56）正式项目和 DISCO 地址，原文件同步保存到 `docs/contracts/bsc.json`；ABI 与现有版本一致。已通过公共 RPC 读取新项目的 `usdt()`、`disco()` 并核对一致。`VITE_BASE_URL`、`VITE_RPC_URL` 保持为空，生产接口使用当前站点同源 `/api/...`。

## Latest home design / 当前首页设计

首页以开发者更正的 Figma 节点 `31235:4061` 为准。新增“切换金额”及对应原始 SVG，使用后端配置选择场次/档位，确认同步首页展示并由预约弹窗承接；关闭未确认选择不改变首页。此前要求的消耗列 `flex-2` 保留，其余两列为 `flex-1`。场次和金额使用统一 Picker，预约已接入链上提交及成功刷新，页面测试由开发者负责。

## API coverage / 接口覆盖

- 首页：Banner、公告、服务端弹窗/已读、预约配置、公共配置。弹窗仅保留“知道了”，已读提交成功后关闭，无详情跳转；正文最小 200px、最大 360px，超出滚动。
- 预约记录：状态分组、分页；预约场次/档位选择弹窗。预约/卖出链上提交已接。
- 激活卡：上架卡、单价、库存、记录、真实赠送；购买数量范围和合计已接，购买链上提交已接。
- 资产：实际 USDT 账户余额与流水；提取金额及手续费、标签右侧余额、输入框内“全部”及分隔线、确认、提交成功刷新；不展示接收地址、最低提取、实际到账和提取提示，保留内部校验。
- 团队/邀请：真实统计、直推分页、邀请码、同源邀请链接；保留邀请码复制，“保存链接”主按钮复制完整邀请链接，移除独立复制链接按钮和海报流程。
- 公告：实际接口分页及详情、404 空态、已读上报、白名单富文本。

列表每页 20 条，不猜总条数；刷新等待真实请求，旧请求以取消、最新请求 guard、登录会话版本隔离。写请求去重、失败保留输入，不自动重试。完整方法与待办见 [接口接入清单](docs/api/README.md)。

## Scope correction / 页面范围更正

已按开发者要求撤回资产页额外增加的提取记录、个人资料入口及对应业务页面，同时移除自行新增的预约详情入口和弹窗。`/withdraw-history` 路由已移除，既有 `/user` 恢复模板空模块，不再提供昵称或头像编辑。相关 API 方法仅保留协议封装，不作为新增 UI 的依据。设计已有资产页、余额流水及提取操作、已接接口和首页 `flex-2` 保留。

## Fixed baseline / 固定界面

Header、从左侧弹出的侧栏、七项菜单顺序及图标、品牌、多语言开关、亮色主题和主按钮皮肤均保留。资产接口只提供 USDT，因此资产单位和图标按真实币种展示；不是改公共主题或图标入口。

## Verification / 验证分工

2026-10-29：最新正式配置已完成 `pnpm build`，prebuild 的 lint、306 项测试及品牌检查通过，TypeScript 与 Vite 构建通过。产物在 `dist/`；已核对包含新正式地址、不含旧正式地址及开发 API/RPC 地址，资源部署前缀保持 `/h5/`。开发环境配置未修改。

开发者负责接口、业务和页面测试。此前联调仅做 TypeScript 及相关源码/样式静态检查，不宣称接口实测通过。本轮开发者明确要求正式配置与生产打包，`pnpm build` 已通过，包含 prebuild 的 lint、全量测试及品牌检查，随后通过 TypeScript 与 Vite 构建；产物在 `dist/`，生产合约地址、无局域网接口/RPC 地址及 `/h5/` 资源前缀已核对。不进行真实钱包交易或浏览器验收。

## Next step / 下一步

代码质量复盘已按开发者指定范围修复：下拉刷新忽略 Portal 弹窗手势，首页公共配置改为后台非阻塞请求，合约封装从 ABI 推导读写方法、参数及返回值，购卡测试改为覆盖当前页面，接入文档同步正式 BSC 配置。拒绝登录签名后的开屏行为按本轮要求保持原状。回归使用隔离接口和钱包桩，strict 类型检查及完整生产构建通过；真实钱包和接口验收仍由开发者负责。

由开发者在钱包环境下测试 API 与本地链预约、购卡、卖出流程，按反馈修正交互；生产部署地址及链 ID 已按正式部署文件配置，不复用本地链地址。Empty 缺省图已替换完成，社交发布元数据等既有待办仍保留。
