# 历史 Mock 资源

当前已经进入接口联调，业务页面不再读取本目录数据。这里保留静态阶段素材和数据参考，不作为真实余额、邀请码或交易结果。

# Mock 数据与资源

静态页面开发期间的本地 mock 数据统一放在此目录，配套图片等资源放在 `assets/`，使用语义化文件名并保留原图。

mock Banner 运行时使用 WebP 压缩资源 `assets/banner.webp`，通过 `@/mock` 导出的 `mockBannerUrl` 引用；2026-10-23 已同步新版 Figma Banner，运行时图为 1380×561，展示槽仍为 690×280。先前用户提供的 `assets/banner.png`（690×280）保留为历史源文件，不直接导入或打包。后续页面按需导入，不发起接口请求。

```tsx
import { mockBannerUrl } from '@/mock'

<img src={mockBannerUrl} alt="Disco 活动" />
```

`home.ts` 集中维护首页本地数据：Banner 列表、公告、参与探索和资产概览。Banner 列表的三项复用同一张 mock 图，便于预览循环；公告取 `notice.ts` 的前三条作上下轮播。它们均不请求后端，联调时再替换数据来源。

`notice.ts` 提供 9 条公告及本地异步读取方法，列表按 `page_no` / `page_size` 分页，当前页面每页 5 条。弹窗沿用 `{ is_show, notice }` 协议；首页最新公告未读时展示，关闭、查看详情或成功读取详情后按 `id + updated_at` 版本记录会话已读。`features/notice/session.ts` 使用 `sessionStorage`，受限时以内存兜底。公告标题、正文属于发布内容，保留原文，不随 UI 语言切换翻译；当前以纯文本安全渲染。AIGO 仅提供协议参考，没有可迁移的公告 UI 或频率规则，正式后端 HTML 内容需在联调时另接受控富文本 renderer。

`reservation.ts`、`activation-card.ts`、`asset.ts` 和 `team.ts` 分别维护预约、激活卡、资产及团队展示数据。`referral.ts` 提供团队与邀请页共用的邀请码 `DBK6P8`，通过路由封装生成当前站点及部署前缀下的完整邀请链接，复制和海报使用同一内容。业务图像放在对应 `src/assets/` 页面目录；均为本地资源，不触发业务接口或 RPC。

`purchase-card.ts` 维护购买激活卡的三种面额、USDT 单价与本地可用余额；与拥有的激活卡库存数据独立。页面选择与数量变化只计算报价，本地确认不会改变余额或库存。
