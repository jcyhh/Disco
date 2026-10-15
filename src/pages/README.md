# Pages
页面模块。

This directory stores route-level React components.
这个目录存放与路由对应的页面级 React 组件。

Keep page files focused on composition, state binding and layout assembly.
页面文件应主要负责组合组件、绑定状态和组织布局。

`main` stores the first-level page system, including the shared layout shell and business pages.
`main` 存放一级页面体系，包括一级页面公共 layout 外壳和业务页面。

Tabbar and sidebar are only two menu display modes of the main layout.
tabbar 和 sidebar 只是 main layout 的两种菜单展示方式。

The six menu entries are maintained in `main/config.ts`. Page directories below are relative to `src/pages/main/`; the home path follows the configured home route through `ROUTE_PATH.home`.
六个菜单项统一在 `main/config.ts` 维护。下表目录均位于 `src/pages/main/`，首页路径由首页配置通过 `ROUTE_PATH.home` 推导。

| 菜单 | 一级页面目录 | 路径 |
| --- | --- | --- |
| 首页 | `home/` | `ROUTE_PATH.home` |
| 预约记录 | `reservation/` | `/reservation` |
| 我的激活卡 | `activation-card/` | `/activation-card` |
| 我的资产 | `asset/` | `/asset` |
| 团队 | `team/` | `/team` |
| 邀请好友 | `invite/` | `/invite` |

The existing `user/` page and `/user` route remain available outside the menu. All six menu pages have static content and local interactions awaiting user visual and interaction acceptance. This does not mark the static-page stage complete: development stays at Step 1, static-page mode remains enabled, and API or contract integration has not started.
原有 `user/` 页面及 `/user` 路由保留，但不再展示在菜单中。六个菜单页面均已有静态内容与本地交互，待用户进行视觉和交互验收；这不代表静态页面阶段已完成。项目继续处于第 1 步，静态页面模式保持开启，不进行接口或合约联调。

## Static page content
## 静态页面内容

| 模块 | 当前本地交互与边界 |
| --- | --- |
| 首页 | Banner 水平轮播、公告垂直轮播与详情弹窗、四个快捷路由；立即预约仅跳转预约记录。 |
| 预约记录 | 状态筛选、长翻译标签横向滚动；卖出确认仅关闭弹窗，不改变订单。 |
| 我的激活卡 | 三种面值与库存展示、记录展开收起、本地转赠表单校验；确认仅关闭，不改变库存。 |
| [我的资产](main/asset/README.md) | 资产预览与明细、提取确认弹窗；确认仅关闭，不改变余额。 |
| [团队](main/team/README.md) | 本地团队统计、直推成员列表、实际复制同源 mock 邀请链接。 |
| [邀请好友](main/invite/README.md) | 实际复制 mock 邀请码和链接，本地 Canvas 合成 PNG 邀请海报并预览、下载。 |

Business display values come from local mock data. The current referral path is `/h5/ref/DBK6P8`, derived from the deployment configuration and mock code; it is not a recovered wallet identity. The pages do not call API/RPC, log into wallets or upload data. Project locale files contain Simplified Chinese, Traditional Chinese and English copy. Page buttons reuse the confirmed shared skin, and fixed Header, sidebar, language switch and theme remain unchanged.
业务展示数值来自本地 mock。当前邀请路径 `/h5/ref/DBK6P8` 由部署配置和 mock 邀请码派生，不作为恢复的钱包身份；页面不请求 API/RPC、不进行钱包登录或上传。项目语言文件包含简体中文、繁体中文和英文文案；业务按钮复用已确认的公共皮肤，固定 Header、侧边栏、多语言开关和主题保持不变。

`BusinessPageHero` supplies the shared page-banner structure for assets and team. `src/mock/referral.ts` supplies the shared referral code and deployment-aware same-origin link for team and invite. The three new modules contain 21 local resources, optimized from 26,258,775 to 1,670,807 bytes (approximately 93.64% smaller); per-page details are recorded in their module notes and `PROJECT_SETUP_STATUS.md`.
我的资产与团队的页内顶部结构复用 `BusinessPageHero`；团队和邀请好友的同源、带部署前缀邀请链接与邀请码统一来自 `src/mock/referral.ts`。三个新模块的 21 份本地资源从 26,258,775 bytes 优化为 1,670,807 bytes，减少约 93.64%；各页详情记录在模块说明及 `PROJECT_SETUP_STATUS.md`。

Menu PNGs are copied unchanged into `src/assets/layout/menu/` using semantic names matching the page directories. Preserve their original colors without brightness filters; selected menu text uses the theme color.
菜单 PNG 按与页面目录对应的语义名称原样复制到 `src/assets/layout/menu/`。图标保留原色，不使用亮度滤镜；选中菜单文字使用主题色。
