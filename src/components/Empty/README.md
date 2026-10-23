# Empty

`<Empty />` displays the shared no-data image and translated `暂无数据` text. `showGap={false}` removes the default `gap-100` top and bottom spacing. `className` composes additional layout classes. Empty-state copy is consistent; no per-page text prop is exposed.

The PNG lives at `src/assets/common/empty.png`. Run `pnpm empty:asset -- --input <image.png>` to replace it and update its width; height stays auto. Resource dimensions are project configuration rather than a fixed test contract.

当前使用用户提供的 320×320 紫色缺省图，资源为 `src/assets/common/empty.png`。按开发者指定显示宽度为 160px，图片高度保持 auto；所有 Empty 使用处统一生效。
