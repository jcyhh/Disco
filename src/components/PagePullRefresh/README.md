# PagePullRefresh
# 页面级下拉刷新

`PagePullRefresh` is a mobile page container for authenticated business routes that need pull-to-refresh.
`PagePullRefresh` 是给已登录业务路由使用的移动端页面级下拉刷新容器。

Pages register their real refresh function through `usePageRefresh()`.
页面通过 `usePageRefresh()` 注册真实刷新函数。

The registered function should return `Promise<void>` when it loads API data, contract data or timers.
如果刷新函数会加载接口、合约或定时器数据，应返回 `Promise<void>`。

The refresh indicator settles only after the registered function finishes.
刷新图标会等注册函数执行完成后再收起。

```tsx
import { useCallback } from 'react'

import { usePageRefresh } from '@/components/PagePullRefresh'

export function DemoPage() {
    const refreshPageData = useCallback(async () => {
        await Promise.all([
            loadUserInfo(),
            loadList(),
        ])
    }, [])

    usePageRefresh(refreshPageData)

    return <section>...</section>
}
```

Disable refresh while a page is submitting a form or writing a contract.
页面正在提交表单或写合约时，可以临时禁用下拉刷新。

```tsx
usePageRefresh(refreshPageData, !submitting)
```

Do not wrap splash, login or other flow pages with this component.
不要把开屏页、登录页或其他流程页包进这个组件。

`onError(error)` optionally handles rejected refresh work. Failures settle the indicator and permit a later pull; no rejected promise escapes a touch event. Route handler cleanup and container unmount invalidate the pending refresh, so late work does not update the next page or restart a settle timer. Pages remain responsible for cancelling their actual requests or ignoring stale response data.

Touch gestures are accepted only from the refresh container's DOM descendants. Portal events from dialogs, pickers and sidebars are ignored, so modal scrolling does not refresh the underlying page or get cancelled by this container.
下拉手势只接受刷新容器真实 DOM 后代的事件。弹窗、Picker 和侧栏通过 Portal 渲染的手势会被忽略，滚动弹窗不会触发底层刷新，也不会被刷新容器阻止。
