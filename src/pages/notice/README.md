# 当前接口接入

当前已改为真实接口，每页 20 条；读取详情及点击首页弹窗“知道了”上报已读，正文使用白名单富文本组件，404 展示空态。真实页面不使用 mock sessionStorage 已读逻辑。

测试由开发者负责。完整接口映射见项目 `docs/api/README.md`。下方为保留的历史静态设计/资源记录，其中 mock 行为不再用于当前页面。

---

# 公告二级页

`NoticeListPage` 和 `NoticeDetailPage` 是脱离主布局的二级页，复用 `SecondaryHeader`、`Empty`、`InfiniteScroll`、主题 token 和公共按钮 mixin。路由与外层鉴权、`PagePullRefresh` 由应用路由负责，本模块不修改固定 Header 或侧栏。

当前仅使用 `src/mock/notice.ts` 的本地 Promise 数据：列表分页契约遵循 AIGO 的 `page_no` / `page_size`，单页 5 条，根据返回条数判断是否还有下一页。触底与“加载更多”按钮共享同一分页 Promise；错误时可重试失败的原请求。下拉刷新实际等待第一页重新加载，以替换已有列表。

`useLatestRequest()` 为请求设置时序 guard：刷新覆盖未完成的旧分页；分页互斥；离页后迟到结果失效。详情状态关联当前路由 ID，切换公告时不显示前一条内容。`parseNoticeId()` 只接受正十进制安全整数；无效 ID 不执行详情查询，不存在的公告显示空态及返回列表链接。详情真实读取后才调用 `markMockNoticeRead()`，旧请求不写回已读状态。

列表展示标题、时间和两行摘要，详情展示全文。公告文本属于后台内容，不作为静态 UI 翻译；控件、提示均通过 `t()`。内容以 React 文本安全渲染并保留换行，不使用 HTML 注入。AIGO 的正式 `content` 如提供富文本，联调阶段需要另行接入经过清洗的富文本 renderer，本轮不将其当 HTML 执行。

不接 API、RPC 或上传。页面视觉和交互验收由开发者进行。
