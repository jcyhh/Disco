# Message

A method-level global toast for services and components:

```ts
import { message } from '@/components/Message/message.ts'
message.success('Saved')
message.warning('Please try again')
message({ message: 'Working', type: 'info', duration: 0 })
message.close()
```

`success`, `info`, `fail`, and `warning` accept optional duration milliseconds. Duration 0 keeps the toast until closed. A single active toast replaces the previous one, clears old timers, and destroys its React root after the closing animation. Message text is rendered as React text, never HTML. Calls without `document` safely do nothing.

Register `Message.scss` in the global style entry so services can import `message.ts` without importing SCSS. Demo: `/showcase/components/primitives`.

按开发者要求同步 AIGO 的 Message 视觉与交互：深色渐变内容区、对应状态的彩色外框、原始状态及关闭图标、底部滑入与缩放退出。图标位于 `src/assets/message/`，配色由 `src/styles/color.scss` 的 `--app-message-*` 控制。现有方法调用 API、单例替换、显示后自动关闭计时及卸载清理保持可用。
