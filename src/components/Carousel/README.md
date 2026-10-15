# Carousel
轮播图组件。

This directory stores reusable carousel variants powered by Swiper.
这个目录存放基于 Swiper 的可复用轮播图类型。

`BasicCarousel` treats every child as one slide. Horizontal slides follow the active child's height by default. Multiple slides loop and autoplay every three seconds, and autoplay continues after interaction. Empty or single-slide content disables looping and autoplay.
`BasicCarousel` 的每个子元素是一张 slide。默认水平轮播，高度跟随当前子元素；多条内容每三秒自动循环，交互后继续播放。空内容或单条内容不启用循环和自动播放。

```tsx
import { BasicCarousel } from '@/components/Carousel'

<BasicCarousel>
    <div className="banner-one">第一张内容</div>
    <div className="banner-two">第二张内容</div>
    <div className="banner-three">第三张内容</div>
</BasicCarousel>
```

Use `direction="vertical"` for announcements and pass a page-specific `className` that sets a fixed carousel height. Vertical mode disables automatic height and makes the content wrapper fill its slide. Keep page-specific spacing, typography and height in the page stylesheet.
公告等垂直轮播传入 `direction="vertical"`，并通过页面自己的 `className` 设置轮播固定高度。垂直模式关闭自适应高度，内容容器填满 slide；页面的间距、字体和高度仍在页面样式中配置。

```tsx
<BasicCarousel direction="vertical" className="home-page__announcements">
    <div>第一条公告</div>
    <div>第二条公告</div>
</BasicCarousel>
```
