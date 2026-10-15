# HTTP
请求模块。

`HTTP_HEADER` centralizes custom request header names. Every request sends the `Authorization` header, including when the local token is empty.
`HTTP_HEADER` 统一存放自定义请求头名称。每个请求都会发送 `Authorization` 头，即使本地 Token 为空也是如此。

`Address` is added only when an injected wallet environment exists. Non-wallet browsers do not send an empty `Address` header.
只有存在注入钱包环境时才会添加 `Address`。非钱包浏览器不会发送值为空的 `Address` 请求头。

`lang` is added only when `APP_CONFIG.enableI18n` is enabled. Disabling i18n removes this header and fixes internal language state to `zh-Hans`.
只有开启 `APP_CONFIG.enableI18n` 时才会添加 `lang`。关闭多语言会移除此请求头，并将内部语言状态固定为 `zh-Hans`。

Every request captures its auth token and session version. A 401 only clears the session that sent it; expired responses from an earlier login do not clear a later login. Request cancellation stays silent. Other failures use the shared `message.warning()` API.
每个请求记录所属 Token 和会话版本。401 只清理发起它的当前会话，旧登录的迟到响应不清理新登录；取消请求不弹提示；其他失败统一走 `message.warning()`。

Client-generated HTTP, auth, DApp and upload error text uses `translate()`; backend-provided error messages are preserved.
前端产生的 HTTP、认证、DApp、上传错误文案使用 `translate()`；后端返回的错误文案保持原样。
