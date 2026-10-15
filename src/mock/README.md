# Mock 数据与资源

静态页面开发期间的本地 mock 数据统一放在此目录，配套图片等资源放在 `assets/`，使用语义化文件名并保留原图。

用户提供的 mock Banner 保留原始尺寸（690×280）与透明度，运行时使用 WebP 压缩资源 `assets/banner.webp`，通过 `@/mock` 导出的 `mockBannerUrl` 引用。原始 `assets/banner.png` 作为源文件保留，不直接导入或打包。后续页面按需导入，不发起接口请求。

```tsx
import { mockBannerUrl } from '@/mock'

<img src={mockBannerUrl} alt="Disco 活动" />
```

`home.ts` 集中维护首页本地数据：Banner 列表、公告、参与探索和资产概览。Banner 列表的三项复用同一张 mock 图，便于预览循环；公告使用不同文本作上下轮播。它们均不请求后端，联调时再替换数据来源。

`reservation.ts`、`activation-card.ts`、`asset.ts` 和 `team.ts` 分别维护预约、激活卡、资产及团队展示数据。`referral.ts` 提供团队与邀请页共用的邀请码 `DBK6P8`，通过路由封装生成当前站点及部署前缀下的完整邀请链接，复制和海报使用同一内容。业务图像放在对应 `src/assets/` 页面目录；均为本地资源，不触发业务接口或 RPC。
