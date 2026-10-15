# Components
通用组件。

This directory stores reusable UI components that are shared by multiple business modules.
这个目录存放可被多个业务模块复用的通用 UI 组件。

Keep business-specific components inside their feature or page directory until they are reused.
业务专属组件先放在对应 feature 或页面目录中，直到确实被复用后再抽到这里。

`PagePullRefresh` is the authenticated business route pull-refresh container. Pages opt in by registering `usePageRefresh()`.
`PagePullRefresh` 是已登录业务路由的下拉刷新容器，页面通过注册 `usePageRefresh()` 启用刷新。

Shared primitives now include `ProgressBar`, `SegmentedTabs`, `InfiniteScroll`, `CountdownTimer`, `ConfirmPopup`, and the method-level `Message` service. See their README files and `/showcase/components/primitives` for neutral usage examples. Business requests, list state and contract actions stay outside these components.
