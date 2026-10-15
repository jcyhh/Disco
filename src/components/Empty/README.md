# Empty

`<Empty />` displays the shared no-data image and translated `暂无数据` text. `showGap={false}` removes the default `gap-100` top and bottom spacing. `className` composes additional layout classes. Empty-state copy is consistent; no per-page text prop is exposed.

The PNG lives at `src/assets/common/empty.png`. Run `pnpm empty:asset -- --input <image.png>` to replace it and update its width; height stays auto. Resource dimensions are project configuration rather than a fixed test contract.
