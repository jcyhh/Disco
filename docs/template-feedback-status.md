# 模板通用优化回灌状态

更新日期：2026-10-15。

本轮只迁入通用基础能力、行为修复、规范和测试；没有迁入业务 ABI、接口、地址、字段、切图、品牌色或页面逻辑。

## 原有反馈

| 编号 | 通用主题 | 状态 |
| --- | --- | --- |
| TRF-001 | 环境文件初始化 | 已回灌 |
| TRF-002 | 可选编辑器设置 | 已回灌 |
| TRF-003 | 初始化问卷与状态 | 已回灌，以当前初始化与可配置流程为准 |
| TRF-004 | Logo 形状政策 | 不回灌旧方案：保留已确认正方形 PNG + contain 政策 |
| TRF-005 | 语言测试跟随配置 | 已回灌 |
| TRF-006 | 局域网开发服务 | 已回灌 |
| TRF-007 | 环境地址隔离 | 已回灌 |
| TRF-008 | 单一品牌资源 | 已回灌 |
| TRF-009 | 部署目录单一来源 | 已回灌 |
| TRF-010 | 开发临时钱包登录 | 已回灌 |
| TRF-011 | 重复工具样式门禁 | 已回灌 |
| TRF-012 | TSX 样式门禁 | 已回灌 |
| TRF-013 | 动态视口配对门禁 | 已回灌 |
| TRF-014 | 一方源码边界 | 已回灌 |
| TRF-015 | 生产构建质量门禁 | 已回灌 |
| TRF-016 | Layout 品牌区检查 | 已回灌 |
| TRF-017 | 按页面自动抽取公共颜色 | 已回灌，以当前初始化与可配置流程为准 |
| TRF-018 | 主按钮与场景控件边界 | 已回灌 |
| TRF-019 | 按钮结构与可选皮肤 | 已回灌 |
| TRF-020 | 规范优先写 Markdown | 已回灌 |
| TRF-021 | 语义命名与全屏 Sidebar | 已回灌，以当前初始化与可配置流程为准 |
| TRF-022 | 公共 ProgressBar | 已回灌 |
| TRF-023 | 切图资源前置 | 已回灌 |
| TRF-024 | Figma 实现清单 | 已回灌 |
| TRF-025 | 静态页本地交互 | 已回灌 |
| TRF-026 | Popup 内容主题 | 已回灌 |
| TRF-027 | 术语表与检查 | 已回灌 |
| TRF-028 | 公共 SegmentedTabs | 已回灌 |
| TRF-029 | 独立页码式 Pagination | 不回灌：由触底加载覆盖移动端实战，页码组件按未来需求增加 |
| TRF-030 | 静态页复用复盘 | 已回灌 |
| TRF-031 | 业务合约目录隔离 | 已回灌 |
| TRF-032 | App 钱包会话恢复 | 已回灌 |
| TRF-033 | 方法式 Message | 已回灌 |
| TRF-034 | 触底 InfiniteScroll | 已回灌 |
| TRF-035 | 完整合约等待反馈 | 已回灌 |
| TRF-036 | 真实数字来源检查 | 已回灌 |
| TRF-037 | 统一默认空态 | 已回灌 |
| TRF-038 | 二级鉴权路由示例 | 已回灌 |
| TRF-039 | 业务能力显式映射 | 已回灌 |
| TRF-040 | 真实 Promise 下拉刷新 | 已回灌 |
| TRF-041 | 页面数据编排与请求守卫 | 已回灌 |
| TRF-042 | 启动钱包账号校验 | 已回灌 |
| TRF-043 | 开屏动画认证门槛 | 已回灌 |
| TRF-044 | 可选路由前缀兼容 | 已回灌 |

## 本轮新增反馈

| 编号 | 通用主题 | 落点 | 状态 |
| --- | --- | --- | --- |
| TRF-045 | 创建器维护代码与生成项目边界 | scripts/pack-create-template.mjs、tests/template-maintenance | 已回灌 |
| TRF-046 | 可配置初始化结果的测试契约 | tests/brand-assets、router-config、dapp-config、i18n-config、vscode-settings | 已回灌 |
| TRF-047 | 会话恢复完成后挂载业务页 | AuthSessionBoundary、isSessionReady、auth/startup | 已回灌 |
| TRF-048 | 迟到响应按会话归属处理 | http/client、auth/lifecycle | 已回灌 |
| TRF-049 | 翻译初始化前的返回值兜底 | i18n/translate | 已回灌 |
| TRF-050 | 公共默认文案与服务错误国际化 | i18n/locales/common、services、公共组件 | 已回灌 |
| TRF-051 | 公共与项目词库分层 | i18n/config、locales/project | 已回灌 |
| TRF-052 | 通用确认弹窗 | components/ConfirmPopup | 已回灌 |
| TRF-053 | 通用倒计时与跨夏令时持续时间 | components/CountdownTimer、shared/time | 已回灌 |
| TRF-054 | 可配置的通用合约诊断 | services/dapp/contractDebug | 已回灌 |
| TRF-055 | payable Gas 估算转发 value | services/dapp/contract、dapp-workflow.test | 已回灌 |
| TRF-056 | 异步 UI 失败与卸载生命周期 | InfiniteScroll、PagePullRefresh、shared-ui-runtime.test | 已回灌 |
| TRF-057 | 统一 Node 运行版本 | package.json、创建器 engines、初始化文档 | 已回灌 |

## 验证入口

- `pnpm test`：项目行为与模板维护测试。生成项目不携带模板维护测试。
- `pnpm lint`：Oxlint、Stylelint、TSX 样式门禁。
- `pnpm build`：先运行完整 verify，再检查品牌初始化，随后执行 TypeScript 与 Vite。
- `pnpm create:verify`：从最终创建器归档生成独立项目，冻结安装，检查品牌门禁并以测试品牌完成真实构建。

创建包验收组合：

1. 默认部署和配置。
2. 根目录、tabbar、账号登录、自定义首页、6 位精度、具体额度授权、精简语言、无 VS Code 配置。
3. 嵌套目录、hybrid、关闭多语言、其他生产链、Gas 检查与估算。

三个组合均替换空态图片，验证资源路径；独立测试项目初始化自己的品牌。模板自身占位 Logo 和未完成品牌状态始终保留，新业务项目仍需提供真实 Logo。

本地分发前执行 `pnpm create:local`，或直接执行包含重新打包的 `pnpm create:verify`。不要复用修复前的归档。

## 本轮验证结果

- 模板测试：248/248 通过。
- 最终创建包生成项目：三个配置组合分别通过全部项目测试、完整 lint、TypeScript/Vite 生产构建及资源路径检查。
- pnpm frozen install 验证通过，pnpm-lock.yaml 为唯一依赖锁文件。
- 开发服务器实浏览器验证通过：进度 60%、受控 tab 切换、主题确认弹窗与 Message 反馈。
- 模板品牌状态保持 false；品牌门禁按设计工作，测试品牌仅存在于临时生成项目。
