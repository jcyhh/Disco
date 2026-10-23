# HTTP 请求

所有业务方法通过共享 `request()` / Axios 客户端发送。开发地址由 `.env.development` 的 `VITE_BASE_URL` 指定（当前 `http://192.168.110.11:9520`），业务路径统一保留 `/api/...`。生产客户端明确使用同源相对地址，`.env.production` 的 `VITE_BASE_URL` 和 `VITE_RPC_URL` 均保持为空。

有 Token 时发送 `Authorization: Bearer ...`，无 Token 时删除该头。只有钱包环境、已登录且地址非空时发送 `Address`，避免登录请求附带旧地址。`lang` 在多语言开启时发送：参考 AIGO 直接传简体 `zh-Hans`、繁体 `zh-Hant`、英文 `en`，不转换为 `zh-CN` / `zh-TW`；关闭多语言时不发送。内部语言配置和切换控件保持原样。

成功响应直接返回 JSON；400/401/404/422/500 的纯文本正文由 `toHttpError()` 提取并交给共享消息反馈。401 仅清理发起请求的当前登录会话；旧账号迟到的响应不清除新会话。取消请求不弹提示。

页面查询通过 `useApiResource` / `useApiList` 使用 `AbortController`、`useLatestRequest` 和登录会话版本隔离旧结果。第一页从 1 开始，每页 20 条，以返回条数判断后续页；刷新等待实际查询完成。写操作使用 `useApiMutation` 阻止重复提交，不自动重试财务请求。

本地已关闭静态模式。恢复钱包签名登录，不注入假 Token 或登录状态；合约支付动作暂未启用。接口原文和覆盖清单见 `docs/api/`。
