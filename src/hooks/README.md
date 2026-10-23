# Hooks
自定义 Hooks。

This directory stores reusable React hooks that can be shared by multiple pages or feature modules.
这个目录存放可被多个页面或业务模块复用的 React 自定义 Hooks。

Prefer clear names such as `useWalletStatus` or `usePageVisible` instead of generic names.
优先使用 `useWalletStatus` 或 `usePageVisible` 这类明确名称，不要使用过于泛的名字。

`useLatestRequest()` protects page data from old async requests writing back after a newer refresh has started.
`useLatestRequest()` 用于避免旧异步请求在新刷新之后回写页面数据。

`usePageReveal<T>()` returns the ref for a route page root. Mark existing content with `data-reveal="rise"`, `"scale"` or `"fade"`; optional `data-reveal-delay="1"` through `"4"` provides a short stagger without inline styles. `src/styles/animate.scss` owns the motion.
`usePageReveal<T>()` 返回路由页面根元素的 ref，现有内容用 `data-reveal="rise"`（轻上移）、`"scale"`（轻缩放）或 `"fade"`（渐显）标记；可用 `data-reveal-delay="1"` 到 `"4"` 设置短错峰，不使用内联样式，动画集中在 `src/styles/animate.scss`。

Reveals run once per element when it enters the viewport. Async list inserts register automatically; updates to existing elements do not replay. Removed elements and unmounted pages release observers. Reduced-motion mode keeps content visible without observing it, unavailable IntersectionObserver falls back to immediate entrance, and keyboard focus reveals a pending element immediately. Only decorate business content; do not animate a whole page wrapper containing fixed navigation.
元素进入视口时仅播放一次，异步列表新增项自动注册，已有元素更新不重播；删除元素和离页时清理观察。系统开启减少动态效果时直接显示，不支持 IntersectionObserver 时退化为直接入场，键盘聚焦时立即显示。仅标记业务内容，不给包含固定导航的整页外壳加变换动画。
