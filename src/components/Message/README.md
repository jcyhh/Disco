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

Register `Message.scss` in the global style entry so services can import `message.ts` without importing SCSS. Visuals use existing status and card theme tokens; no project assets are required. Demo: `/showcase/components/primitives`.
