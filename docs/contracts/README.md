# Disco 合约接入

部署原文件为开发者提供的 [localhost.json](localhost.json)，作为 ABI 和部署数据读取。业务方法按 [接口协议](../api/frontend-api.md) 映射，不从 ABI 扩展设计之外的入口。

开发网络为 31337，RPC 按开发者最新指定使用 `http://192.168.110.180:8545`。写链明确执行网络校验，不使用共享初始化默认的“开发环境跳过切链”。当前开发 env：

| 变量 | 值 |
| --- | --- |
| `VITE_CONTRACT_CHAIN_ID` | `31337` |
| `VITE_USDT` | `0xD2684e46421F2B7316205a591a3A3b109279E683` |
| `VITE_DISCO` | `0xE04a52aFc0BF7d0a5771934aa1049bb424555A9D` |
| `VITE_DISCO_PROJECT` | `0x0E6C84109637631F5c60996f6f5463A09222A469` |

生产部署使用开发者提供的 [bsc.json](bsc.json)，链 ID 为 56，ABI 与本地部署一致。`.env.production` 配置如下：

| 变量 | 值 |
| --- | --- |
| `VITE_CONTRACT_CHAIN_ID` | `56` |
| `VITE_USDT` | `0x55d398326f99059fF775485246999027B3197955` |
| `VITE_DISCO` | `0x6Af9BDb2967517f90a9a9e3259D1F5F0cD278a0c` |
| `VITE_DISCO_PROJECT` | `0xDFe69eb1407B3d93ca5d5A2E024F2B398e5E9533` |

USDT 地址由 BSC 正式项目合约的公共 `usdt()` 读取确认，`disco()` 返回值与部署文件一致。生产 `VITE_BASE_URL`、`VITE_RPC_URL` 继续为空，接口使用同源 `/api/...`，RPC 使用 BSC 链预设。开发环境配置不变。

## 页面与签名映射

| 操作 | 后端签名 | 合约方法与参数 |
| --- | --- | --- |
| 首页确认预约 | `POST /api/reserves`，`amount_id` | `joinQueue(id, amount, recipient, deadline, sign)` |
| 确认购买激活卡 | `POST /api/activation_cards/buy`，`card_id`、`num` | `buyCard(id, amount, recipient, deadline, sign)` |
| 卖出中确认卖出 | `POST /api/reserves/sell`，`id` | `sellDisco(id, token_amount, usdt_amount, leader_address, leader_amount, deadline, sign)` |

后端金额是最小单位字符串，直接转 bigint，不再次乘精度。预约/购卡的 UI 预计支付额按 ERC20 `decimals` 转最小单位，与签名支付数量核对。卖出以签名返回的实际 DISCO 数量检查余额、授权并提交，不强制与列表展示数量相等。预约/购卡使用 USDT，卖出使用 DISCO，spender 均为 DiscoProject。无团队长时保留签名提供的零地址和零奖励额，不修改签名字段。

`src/services/contracts/disco.ts` 复用 `src/services/dapp` 的钱包、网络、Gas、ERC20 授权和写链封装。完整动作由 `runDappContractWorkflow` 包裹，覆盖部署/余额/授权检查、后端签名、钱包确认、回执和 `waitForDappContractDataSync`。公共 ContractLoading 全程展示，页面提交防重并暂停下拉刷新。

预约/购卡先检查钱包余额并完成授权，再申请 90 秒签名；卖出先取得签名，再按实际数量检查余额和授权。提交前再次校验账号、会话、网络和过期时间。授权和最终交易均绑定预期钱包账号。Gas 检查、估算和最大授权策略保持项目既有配置。

交易失败不自动提交新订单。同一运行期间按网络、合约、账户、动作及业务参数缓存未过期的签名，用户再次确认时复用；若全局 ID 已使用，只同步和刷新。刷新浏览器或签名过期后缓存失效；预约超时的退卡由后端处理。前端不会伪造成功、库存或余额。

只读取合约公开 `usdt/disco` 配置、全局 ID 使用标记及带明确 owner 参数的 ERC20 余额/授权。没有新增依赖 `msg.sender` 的无参用户数据读取。提取由后端转账；Mock 铸币、管理、批量发币、资金救援等 ABI 方法均未开放页面入口。

合约读写封装从字面量 ABI 推导方法名、参数和返回值；`tests/dapp-contract-types.test.mjs` 编译正反例验证类型约束，运行测试使用隔离钱包桩验证透传、授权与等待状态，不发起真实交易。生产打包执行完整 `pnpm build` 门禁，真实钱包与后端联调验收由开发者负责。
