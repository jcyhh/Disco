# Project contract services
# 项目合约服务

Use this directory for project-specific contract wrappers.
项目专属合约封装放在本目录。

`src/services/dapp` owns generic wallet, chain, ERC20 and common router capabilities.
`src/services/dapp` 只负责通用钱包、链、ERC20 和通用 Router 能力。

Project ABI files, contract addresses and page-facing contract methods should live here instead of polluting the generic DApp module.
项目 ABI、合约地址和页面会调用的合约业务方法应放在这里，不要污染通用 DApp 模块。

Recommended files:
推荐文件：

- `config.ts`: reads project contract addresses from env and validates required addresses.
- `config.ts`：读取项目合约地址 env，并校验必填地址。
- `<contractName>.ts`: owns one project contract ABI plus read/write methods.
- `<contractName>.ts`：维护一个项目合约 ABI 以及对应读写方法。
- `index.ts`: re-exports project contract wrappers.
- `index.ts`：统一导出项目合约封装。

Common ABI can be imported from `src/services/dapp`, for example `ERC20_ABI` and `UNISWAP_V2_ROUTER_ABI`.
通用 ABI 从 `src/services/dapp` 引入，例如 `ERC20_ABI` 和 `UNISWAP_V2_ROUTER_ABI`。

## Read account rules
## 读取 account 规则

Do not omit `account` only because a contract call is a `view` / `pure` read.
不要只因为合约调用是 `view` / `pure` 读取就省略 `account`。

Before adding a page-facing read, check whether the function has no `user`, `owner` or `account` parameter, but returns data related to the current user's assets, orders, rewards, claim eligibility or permissions.
新增页面会调用的读取前，先检查该方法是否没有 `user`、`owner` 或 `account` 参数，但返回值却与当前用户资产、订单、收益、领取资格或权限有关。

If the contract implementation uses `msg.sender`, or may depend on `msg.sender` for identity, permission or delegated-account context, pass the connected wallet address with `readContract({ ..., account: connectedAddress })`.
如果合约实现使用 `msg.sender`，或可能依赖 `msg.sender` 判断身份、权限或委托账户上下文，就用 `readContract({ ..., account: connectedAddress })` 传入当前连接钱包地址。

`readDappContract` supports optional `account`; project contract wrappers should pass it only for user-context reads.
`readDappContract` 支持可选 `account`；项目合约封装只在依赖用户上下文的读取里传入。

Public reads such as global config, public market data, public行情 and Token metadata should not require `account`.
全局配置、公共行情、Token 元数据等公共读取不应要求 `account`。

EIP-7702 delegated accounts need this rule because missing `account` / `from` in `eth_call` may execute under an empty-address context and revert.
EIP-7702 委托账户需要这条规则，因为 `eth_call` 缺少 `account` / `from` 时可能以空地址上下文执行并回退。

Every new user-context read must include regression tests for business-layer address passing, `readDappContract` forwarding to viem `readContract`, and public reads staying account-free.
每次新增依赖用户上下文的读取，都必须补回归测试，覆盖业务层传入地址、`readDappContract` 透传给 viem `readContract`，以及公共读取不传 `account`。
