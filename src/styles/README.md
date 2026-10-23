# Shared styles
公共样式。

`interaction.scss` 统一按钮、链接和按钮角色控件的点触反馈：按住时轻微缩小并压暗，松开恢复。没有按钮语义的既有可点击图标/品牌区使用 `tap-target` 复用。禁用、`aria-disabled`、`aria-busy` 控件不触发按压效果；系统减少动态效果模式仅保留即时明暗反馈。独立 `scale` 属性与内容入场的 `transform` 互不覆盖，按钮默认皮肤、尺寸及业务逻辑不变。

一级业务页的内容入场动画集中在 `animate.scss`，配合 `usePageReveal` 和 `data-reveal` 标记使用。只动画 `opacity` 和 `transform`，采用有限时长及短错峰；系统减少动态效果设置下不隐藏内容、不播放新增入场动画。Header、侧栏与弹窗沿用原有结构和动画。

Disco uses a light theme configured in `color.scss`: a top-to-bottom `#F8EAFE` to `#F9F9F9` page gradient, `#D11BFF` primary color and black default text. The page gradient occupies 800 design pixels and scrolls with the page, with the solid end color below it; shared cards, navigation, dialogs, borders and loading indicators consume the theme variables. Keep the browser theme metadata in `index.html` aligned when changing the overall color scheme.
Disco 的亮色主题统一配置在 `color.scss`：页面背景由上到下从 `#F8EAFE` 渐变至 `#F9F9F9`，主题色为 `#D11BFF`，默认文字为黑色。页面渐变范围统一为 800 设计像素，随页面滚动，下面延续底色，公共卡片、导航、弹窗、边框和加载指示器读取主题变量。切换整体主题时，同步更新 `index.html` 中的浏览器主题元数据。

Write page styles in SCSS and compose existing utility classes in JSX before adding private declarations. `pnpm stylelint` rejects declarations already represented by global utilities; `pnpm lint:tsx-styles` rejects JSX inline styles. Both checks skip `src/vendor` and `src/third-party`.
页面使用 SCSS，新增私有声明前先在 JSX 组合现有工具类。`pnpm stylelint` 拦截已有工具类对应的重复声明，`pnpm lint:tsx-styles` 拦截 JSX 内联样式。两类规则都排除 `src/vendor` 和 `src/third-party`。

Pair every legacy `vh`/`vw` declaration with an immediately following matching `dvh`/`dvw` declaration. This includes values inside `calc()`.
所有传统 `vh`/`vw` 声明后紧接匹配的 `dvh`/`dvw` 声明，包括 `calc()` 内的值。

Use `full-btn` or `full-button()` for full-width actions and `auto-btn` or `auto-button()` for content-width actions. Their defaults follow the 750px Figma design: full-width actions are 80px high with 30px horizontal padding and 32px/600 text; small actions are 56px high with 24px horizontal padding and 24px/500 text. Both use a 999px pill radius and an 8px content gap. These design pixels are converted to viewport units by PostCSS.
通栏操作使用 `full-btn` 或 `full-button()`，内容自适应操作使用 `auto-btn` 或 `auto-button()`。默认尺寸遵循 750px Figma 设计稿：通栏按钮高 80px、水平内边距 30px、字号 32px、字重 600；小按钮高 56px、水平内边距 24px、字号 24px、字重 500。两种按钮均使用 999px 胶囊圆角和 8px 内容间距，设计稿像素由 PostCSS 转为视口单位。

Both structures consume `--app-btn-bg`, `--app-btn-color` and `--app-btn-shadow`: a horizontal gradient from `--app-btn-gradient-start` (`#753DEA`) to `--app-btn-gradient-end` (`#B34CF7`), white text and a 20px white inset glow at 60% opacity. The global primary color remains `#D11BFF`, and normal page text remains black. `full-btn` uses the same unmodified `full-button()` defaults as Picker. Mixins retain their existing positional arguments for compatibility. Icons are supplied by the caller only when the design calls for them.
两种按钮默认读取 `--app-btn-bg`、`--app-btn-color` 和 `--app-btn-shadow`：背景从 `--app-btn-gradient-start`（`#753DEA`）横向渐变到 `--app-btn-gradient-end`（`#B34CF7`），白色文字，并带 20px、60% 白色内发光。全局主题色仍为 `#D11BFF`，普通页面文字保持黑色。`full-btn` 与 Picker 直接使用同一套 `full-button()` 默认值，mixin 保留原有位置参数以兼容已有调用；仅在设计需要时由调用方传入图标。

`full-btn` and `auto-btn` share the same `button-skin()` through their structural mixins. New primary-button variants change geometry such as size, radius and padding while keeping this shared skin. Maintain the gradient, white text and inset glow in `color.scss`; business pages must not repeat those declarations.
`full-btn` 和 `auto-btn` 的结构 mixin 统一调用 `button-skin()`，默认使用同一套皮肤。后续主按钮变体只调整大小、圆角、内边距等几何尺寸，继续复用共同皮肤。渐变、白字与内发光统一在 `color.scss` 维护，业务页面不要重复编写这些声明。

```scss
.order-page {
    &__submit {
        @include full-button($height: 88px, $radius: 20px);
    }

    &__action {
        @include auto-button($height: 64px, $radius: 16px, $padding: 28px);
    }

    &__custom-control {
        @include button-skin();
    }
}
```

For an existing special structure, use `button-skin()` or add `btn-primary` in `className` to apply only the shared colors and shadow. Keep the control's layout and interaction intact; Header controls can explicitly reuse the same skin without rebuilding the shared header.
已有特殊结构可以调用 `button-skin()`，或在 `className` 中添加 `btn-primary`，只复用颜色与阴影。控件原有布局和交互保持不变；Header 控件需要此皮肤时也应显式复用，保留公共 Header 结构。

Compose optional skins with either structure: `full-btn btn-solid`, `auto-btn btn-gradient`, or `full-btn btn-gradient-border`. Configure the corresponding `--app-btn-*` variables in `color.scss`. Header controls and other scene-specific actions keep their own component styles.
可选皮肤可与任意结构组合：`full-btn btn-solid`、`auto-btn btn-gradient` 或 `full-btn btn-gradient-border`。在 `color.scss` 配置对应 `--app-btn-*` 变量。Header 等场景控件在自己的组件中维护样式。

Popup gradient-card tokens represent background images. Keep `--app-popup-gradient-card-bg` and `--app-popup-gradient-card-border` as gradients, including two identical stops for a solid appearance, because the mixin uses multiple background layers.
Popup 渐变卡片变量代表背景图像。`--app-popup-gradient-card-bg` 和 `--app-popup-gradient-card-border` 必须保持渐变；需要纯色效果时使用两个相同颜色的色标，因为 mixin 会将它们组成多层背景。

`--app-page-bg-height: 800px` 统一维护页面渐变高度，沿用 750px 设计稿及现有 PostCSS 视口换算。`page-background($top)` 复用底色、渐变尺寸、偏移和不重复/随页面滚动的规则。一级布局从 Header 下方（88px + 顶部安全区）开始；公告等二级页使用 `secondary-page-background min-vh-100`，从 SecondaryHeader 下方（100px + 顶部安全区）开始；无导航的流程页从顶部开始。页面长短不拉伸渐变，800px 后保持 `#F9F9F9`。侧边栏自身背景和页面专属切图不属于页面背景层，保留已确认样式。
