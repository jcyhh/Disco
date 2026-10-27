# 购买激活卡

一级路由 `/purchase-card`，对应更新后的 Figma `NVwAAv12WZx1LiCTqPMNWD` 节点 `32222:989`。页面直接渲染 `/api/activation_cards` 返回的卡列表，名称、单价、卡 ID 均来自接口。`src/features/activation-card/config.ts` 只配置本地封面，按接口列表顺序使用。选择状态按接口卡 ID 保存，默认选择接口首项；`amount` 作为 USDT 单价参与展示和合计计算。不再固定生成三种卡，也不按卡名或售价过滤接口数据。接口未就绪、失败或列表为空时不能购买。`/api/users/my` 的 USDT 可用余额仅展示，链上钱包余额由交易封装校验。

数量允许一到一百万，安全正整数解析由 `purchase.ts` 提供。页面通过十进制计算工具重算合计，用户确认弹窗后才调用 `buyActivationCardsWithWallet`。该封装完成钱包余额检查、USDT 授权、后端签名和 `buyCard`，等待成功回执及索引同步后刷新卡和账户信息。提交中禁用确认和下拉刷新，失败保留选择及数量供用户主动重试。

`tests/purchase-card.test.mjs` 直接挂载当前页面，以隔离接口和交易桩检查接口卡名与价格、列表顺序与空列表、精确合计、实际卡 ID/数量/总价、确认前不提交、重复点击去重、成功刷新、失败保留表单与主动重试。真实接口和钱包交易验收由开发者负责。

页面复用 `BusinessPageHero`、`ConfirmPopup`、公共星形图标、主题 token、栅格/间距/字号工具类及 `full-button` / `auto-button`。横幅关闭空遮罩，三列选卡使用原生 radio，数量使用数字键盘文本输入，动作使用按钮。长翻译允许换行，Header、单图标语言开关和侧栏保持固定基线。

当前页面资源在 `src/assets/purchase-card/`：`hero-banner.webp`、`card-10.webp`、`card-20.webp`、`card-30.webp`、`selected.svg`、`unselected.svg`。四张位图从 8,789,105 bytes 优化到 304,026 bytes，横幅保留 1024×339，卡图为 400×400。侧栏图标为 `src/assets/layout/menu/purchase-card.png`。

正式配置和接口/合约映射见项目 `docs/api/README.md` 与 `docs/contracts/README.md`。
