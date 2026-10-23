# 页面模块

每个路由使用模块目录保存 TSX、SCSS 及必要辅助逻辑。菜单由 `main/config.ts` 集中维护，七个一级页使用已确认的 MainLayout / Header / 左侧侧栏：

| 页面 | 目录 | 路由 |
| --- | --- | --- |
| 首页 | `main/home/` | `ROUTE_PATH.home` |
| 预约记录 | `main/reservation/` | `/reservation` |
| 购买激活卡 | `main/purchase-card/` | `/purchase-card` |
| 我的激活卡 | `main/activation-card/` | `/activation-card` |
| 我的资产 | `main/asset/` | `/asset` |
| 团队 | `main/team/` | `/team` |
| 邀请好友 | `main/invite/` | `/invite` |

二级页使用 `SecondaryHeader`，位于认证和 `PagePullRefresh` 内、`MainLayout` 外：公告列表 `/notice`、公告详情 `/notice/:id`。资产页不提供设计外的提取记录、个人资料入口；既有 `/user` 仅保留模板空模块。

当前 `.env.development` 已关闭静态模式，恢复钱包签名登录，使用开发者提供的 API。页面不再导入本地 mock 业务数据；mock 文件与历史素材仅保留作参考。业务数据通过 `src/features/<feature>/api.ts` 获取，加载、分页、失败重试、刷新、过期请求隔离和提交保护由共享 hooks 提供。

首页预约弹窗支持场次、档位选择；预约、卖出和购卡确认后进入完整合约流程，先校验余额和授权，再请求签名并写链，成功等待索引同步后刷新，不独立创建预备订单。赠卡、提取均使用接口，成功后刷新相关页面数据。团队/邀请链接使用真实 `referral_code`，继续带配置部署前缀。

公告正文使用白名单富文本组件；列表、正文与弹窗读取同一服务端协议，关闭或阅读后上报已读。API 当前提供 USDT 余额与流水，资产页按真实单位展示。首页发行介绍沿用已确认设计文案，公共配置未提供其动态字段。

业务按钮沿用统一皮肤，公共 Header、侧栏、Logo、多语言开关和主题保持固定。接口映射、已接功能与合约映射见 [接口接入清单](../../docs/api/README.md)。开发者负责测试和页面验收。

新增页面以设计及开发者明确要求为准；只有公告列表、公告详情等明确存在且无争议的配套页面可直接补充。接口文档中存在某个接口，不代表可以自行新增对应页面。
