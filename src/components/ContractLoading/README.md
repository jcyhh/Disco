# ContractLoading
合约写入等待遮罩组件。

`ContractLoading` is a full-screen blocking loading overlay for contract write waiting states.
`ContractLoading` 是用于写合约等待状态的全屏阻塞 loading 遮罩。

It uses the shared `Popup` for overlay, scroll locking and destroy-on-close behavior, then renders the loader with inline SVG.
它使用通用 `Popup` 处理遮罩、锁滚动和关闭销毁，再用内联 SVG 绘制 loading。

旋转圆点采用主题深紫、浅紫到亮紫的渐变，复用现有渐变端点与主题色；保留圆点融合滤镜和原有旋转节奏。

The overlay cannot be closed by clicking the backdrop, because contract write waiting should block user interaction.
遮罩不能通过点击背景关闭，因为写合约等待时应阻止用户继续操作。

```tsx
import { ContractLoading } from '@/components/ContractLoading'

<ContractLoading show={contractPending} />
```
