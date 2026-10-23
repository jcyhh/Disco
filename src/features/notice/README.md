# 公告接口

`api.ts` 集中维护 `/api/notices`、`/api/notices/{id}`、`/api/notices/pop`、`/api/notices/{id}/read`。分页每页 20 条，没有总条数；无弹窗公告时 `notice` 为 `null`。语言由共享 `Lang` 请求头传递。

首页轮播、公告栏、预约配置、弹窗公告及公共配置共用整屏加载/刷新。`HomeNoticePopup` 使用服务端 `is_show` 判断展示；弹窗仅保留“知道了”，点击后调用已读接口，成功后关闭；提交中防重复点击，失败保持弹窗以便重试。不提供关闭图标、遮罩关闭或详情跳转。正文最小高 200px、最大高 360px，超出自动纵向滚动。详情读取后也调用已读接口。真实页面不再使用 mock 的 sessionStorage 去重；`session.ts` 仅保留供历史 mock 使用，不参与当前服务端已读判断。

列表 `/notice` 和详情 `/notice/:id` 使用 `SecondaryHeader`，位于鉴权和 `PagePullRefresh` 内、`MainLayout` 外。列表支持分页、失败原页重试和下拉刷新；详情 404 显示空态，其他错误可重试。请求取消与时序保护由公共 hooks 负责。

正文通过 `NoticeContent` 的标签白名单渲染段落、列表、图片和链接，不透传事件、样式、脚本、iframe 或原始 HTML 属性。链接和图片仅接受 HTTP(S)；摘要使用纯文本。公告发布内容原样展示，UI 提示提供三种语言。

接口及页面测试交给开发者，当前仅做必要的类型与源码检查；不进行浏览器验收。
