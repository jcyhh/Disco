# Router
路由模块。

The project always uses browser history mode.
项目固定使用浏览器 history 模式。

The app base path is controlled by `APP_CONFIG.routeBase`, and the current template value is `/h5/`.
应用基础路径由 `APP_CONFIG.routeBase` 控制，当前模板值为 `/h5/`。

The layout menu type is controlled by `APP_CONFIG.defaultLayoutMenuType`. `tabbar` and `sidebar` are mutually exclusive project modes.
layout 菜单类型由 `APP_CONFIG.defaultLayoutMenuType` 控制。`tabbar` 和 `sidebar` 是互斥的项目模式。

Use the navigation helpers inside React components.
在 React 组件内使用路由跳转辅助方法。

```tsx
import { ROUTE_PATH, useAppNavigate } from '../router/index.ts'

function Demo() {
    const { pushRoute, replaceRoute, backRoute } = useAppNavigate()

    return (
        <>
            <button onClick={() => pushRoute(ROUTE_PATH.home)}>Go home</button>
            <button onClick={() => replaceRoute(ROUTE_PATH.user)}>Replace with User</button>
            <button onClick={() => backRoute()}>Go back</button>
        </>
    )
}
```

Do not manually prepend `/h5` when calling `pushRoute(ROUTE_PATH.home)`.
调用 `pushRoute(ROUTE_PATH.home)` 时不要手动拼接 `/h5`。

`AppBrowserRouter` accepts URLs both with and without the `/h5` prefix.
`AppBrowserRouter` 同时兼容带 `/h5` 和不带 `/h5` 的访问路径。

This matches H5 deployments where `/`, `/ref/...` and `/h5/...` all return the same entry HTML without an HTTP redirect.
这用于适配服务端将 `/`、`/ref/...` 和 `/h5/...` 都直接返回同一份入口 HTML、但不做 HTTP 重定向的部署方式。

Inside the app, keep route paths prefix-free. `AppBrowserRouter` strips `/h5` before matching and adds `/h5` when React Router creates browser hrefs or navigates.
应用内部路由仍保持不带前缀。`AppBrowserRouter` 会在匹配前剥离 `/h5`，并在 React Router 生成浏览器链接或跳转时补回 `/h5`。

Use `buildRouteHref` only when code outside React components needs to generate a link.
只有组件外代码需要生成链接时，才使用 `buildRouteHref`。

```ts
buildRouteHref(ROUTE_PATH.home) // /h5/home
```

## Deployment and second-level pages

Configure the base only in `src/config/deployment.ts`; Vite and APP_CONFIG derive their base from it. Root `/` and nested prefixes share the same prefix-free internal routes.
部署目录只改 `src/config/deployment.ts`；Vite 和 APP_CONFIG 由它派生。根目录与嵌套目录使用同一组无前缀内部路由。

Put second-level routes under RequireAuthentication / PullRefreshRouteOutlet and alongside MainLayout, so they keep authentication and refresh without inheriting the first-level header or menu:
二级路由放在 RequireAuthentication / PullRefreshRouteOutlet 内、与 MainLayout 平级，保留鉴权和刷新而不继承一级 Header 或菜单：

```tsx
<Route element={<RequireAuthentication />}>
    <Route element={<PullRefreshRouteOutlet />}>
        <Route element={<MainLayout />}>{/* first-level routes */}</Route>
        <Route path="details" element={<DetailsPage />} />
    </Route>
</Route>
```

DetailsPage uses SecondaryHeader and a real Promise-returning usePageRefresh handler. Keep it out of MAIN_PAGE_ITEMS. RequireAuthentication waits for isSessionReady before mounting pages.
DetailsPage 使用 SecondaryHeader，并向 usePageRefresh 注册真实返回 Promise 的刷新函数；不要加入 MAIN_PAGE_ITEMS。RequireAuthentication 等待 isSessionReady 后才挂载页面。
