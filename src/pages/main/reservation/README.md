# 当前接口接入

“卖出中”的卡片文案按 Figma `31024:2808` 展示：获得、当前收益金额、当前收益减少、当前收益率、周期及立即卖出；收益与减少金额单位为 USDT，不自行改写成“当前可卖出收益”。本次只同步展示文案，沿用当前数据字段与交易逻辑。

“进行中”已同步最新 Figma `31024:2639`：详情展示获得数量、当前收益金额（`profit_amount`，USDT）、当前收益率与周期，移除收益减少行。排队中、卖出中与已完成仍保持各自既有内容；不因该节点调整固定 Header、菜单或主题。复用现有 USDT 图标与卡片布局，无新增资源或样式。

当前使用 `/api/reserves` 的真实记录，3 / 4 / 6 / 8 页签对应后端分组，支持分页和刷新。按 `can_sell` 与订单状态显示卖出入口；确认后通过 `sellReserveWithWallet` 校验 DISCO 余额和授权、获取后端签名，并按最小单位参数调用 `sellDisco`；成功等待索引同步后刷新当前列表。

测试由开发者负责。完整接口映射见项目 `docs/api/README.md`。下方为保留的历史静态设计/资源记录，其中 mock 行为不再用于当前页面。

---

# 预约记录静态页面

`ReservationPage.tsx` 使用四个状态的本地 mock 展示预约卡片，当前仍处于第 1 步静态页面开发。视觉和交互验收由开发者负责。

| 状态 | Mock 条数 | Figma 节点 |
| --- | --- | --- |
| `queued` 排队中 | 4 | [30993:1871](https://www.figma.com/design/NVwAAv12WZx1LiCTqPMNWD?node-id=30993-1871) |
| `active` 进行中 | 3 | [31024:2639](https://www.figma.com/design/NVwAAv12WZx1LiCTqPMNWD?node-id=31024-2639) |
| `selling` 卖出中 | 3 | [31024:2808](https://www.figma.com/design/NVwAAv12WZx1LiCTqPMNWD?node-id=31024-2808) |
| `completed` 已完成 | 3 | [31024:2978](https://www.figma.com/design/NVwAAv12WZx1LiCTqPMNWD?node-id=31024-2978) |

## 数据与复用

`src/mock/reservation.ts` 管理前端展示模型及数据，通过 `getMockReservationRecords()` 过滤状态，不请求后端或进行财务计算。卡片共用参与金额和时间，排队中展示可获得及周期；进行中和卖出中按数据展示当前收益金额、减少和收益率。已完成的收益减少为可选字段：首条展示，后两条省略；按 `undefined` 判断缺失，保留字符串 `0` 的展示语义。

USDT 图标复用 `@/assets/tokens` 的 `usdtIconUrl`，卡片复用 `app-card`，按钮复用统一主按钮皮肤，仅配置自身几何。固定 Header、左侧侧栏、菜单、品牌、原单图标语言开关及主题均保持不变。

状态入口复用 `SegmentedTabs variant="pills"`，长文本支持横向滚动，选中项自动进入横向可视区。简体中文、英文和繁体中文词条已补齐，保留完整英文文案。

## 本地交互

进行中和卖出中卡片的“立即卖出”仅打开本地 `ConfirmPopup`。确认或关闭都会清除当前选中记录并关闭弹窗，不修改订单状态，不触发 API、RPC 或链上操作。

页面保持静态 mock，不注册虚假的 `usePageRefresh()` 刷新函数；真实数据加载与刷新留待联调阶段。
