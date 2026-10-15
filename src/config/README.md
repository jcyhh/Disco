# Config
全局配置。

Project-level startup configuration lives here, such as the app name, route base path, default layout menu type and default language.
项目级初始化配置放在这里，例如应用名称、路由基础路径、默认 layout 菜单类型和默认语言。

`enableStaticPageMode` is enabled only when Vite is in development and `.env.development` sets `VITE_STATIC_PAGE_MODE = 1`. Static mode keeps the session signed in without writing fake credentials, skips wallet restoration and user-profile loading, and sends root/login entries to home. HTTP requests are silently canceled before transport; RPC and Flutter uploads are paused. Use local page data during this stage. Set the flag to `0` before API/contract integration. Production always uses the real authentication and request flows.
`enableStaticPageMode` 仅在 Vite 开发环境且 `.env.development` 配置 `VITE_STATIC_PAGE_MODE = 1` 时开启。静态模式固定已登录，不写入假 Token，跳过钱包恢复与用户资料请求，根目录和登录入口直接进入首页。HTTP 请求在发送前静默取消，RPC 和 Flutter 上传也暂停；此阶段页面使用本地静态数据。接口/合约联调前将开关改为 `0`。生产环境始终使用真实鉴权和请求流程。

`defaultLayoutMenuType` is a project-level single-choice menu mode. Use `tabbar` for bottom navigation or `sidebar` for side navigation, but do not use both in the same project.
`defaultLayoutMenuType` 是项目级单选菜单模式。`tabbar` 表示底部导航，`sidebar` 表示侧边栏导航，同一个项目不要同时使用两种。

The app name is read from `VITE_APP_NAME`, so HTML metadata and TypeScript configuration use the same source.
应用名称读取 `VITE_APP_NAME`，这样 HTML 元信息和 TypeScript 配置使用同一个来源。

`loginMode` controls the permitted authentication entry: `dapp` requires a wallet environment, `hybrid` accepts either a wallet or an account password, and `account` only uses account password login. The template defaults to `dapp`.
`loginMode` 控制允许的登录入口：`dapp` 必须在钱包环境中登录，`hybrid` 同时支持钱包和账号密码登录，`account` 仅使用账号密码登录。模板默认使用 `dapp`。

`enableI18n` controls both language switching and the request `lang` header. It defaults to `true`; development defaults to `zh-Hans`, and production defaults to `en`. When set to `false`, the application is fixed to `zh-Hans`, and shared components can continue calling `t()` without extra conditions.
`enableI18n` 同时控制语言切换和请求 `lang` 头，默认值为 `true`；开发环境默认 `zh-Hans`，生产环境默认 `en`。设为 `false` 时，应用固定使用 `zh-Hans`，公共组件仍可直接调用 `t()`，无需增加额外判断。

Module-specific protocol configuration should stay inside its own module, such as `HTTP_HEADER`, `STORAGE_KEY` and i18n resource lists.
模块内部协议配置应继续留在模块内，例如 `HTTP_HEADER`、`STORAGE_KEY` 和多语言资源列表。
