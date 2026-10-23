# 图片资源优化

页面资源按业务目录保存。2026-10-23 对正式包中较大的剩余 PNG 和内嵌位图进行了无损优化，小图保持原样。

| 资源 | 优化前 bytes | 优化后 bytes | 处理 |
| --- | ---: | ---: | --- |
| `splash/splash-logo.webp` | 711645 | 494946 | 原尺寸透明 PNG 转无损 WebP |
| `home/quick-activation-card.webp` | 105861 | 74708 | 原尺寸透明 PNG 转无损 WebP |
| `home/quick-asset.webp` | 102094 | 71032 | 原尺寸透明 PNG 转无损 WebP |
| `home/quick-invite.webp` | 107428 | 74108 | 原尺寸透明 PNG 转无损 WebP |
| `home/quick-reservation.webp` | 108714 | 76050 | 原尺寸透明 PNG 转无损 WebP |
| `common/button-icon.svg` | 480274 | 188815 | 内嵌 PNG 转无损 WebP，SVG 外层尺寸、图案和变换保持原样 |
| `common/empty.png` | 141336 | 130679 | 无损重新编码 PNG，保留 `pnpm empty:asset` 更新流程 |

合计减少 647014 bytes。WebP 使用本机 libwebp 1.6.0 的 `cwebp -lossless -exact -m 6` 编码，在 `-q 75` 和 `-q 100` 的无损编码结果中保留较小者；这里的 `-q` 控制无损编码努力程度。所有替换均已解码为 RGBA，验证宽高及每个像素（包括透明区域）完全一致。

原有 WebP 大图已采用有损编码，无损重编码未能减少体积，因此保持原样，避免叠加有损压缩。启动图和四个快捷入口的原 PNG 留作源图，运行时仅引用对应 WebP；原 PNG 不进入构建产物。

后续替换这些源图时，应重新生成相应 WebP 并核对透明度与尺寸。SVG 内嵌的是位图，不能仅按扩展名将其视为小型矢量图。
