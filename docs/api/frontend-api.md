# 前端接口

基地址：`http://{host}:9520/api`

除登录外，需要登录的接口都要带：

```
Authorization: Bearer {token}
```

可选请求头：

| 头 | 说明 |
| --- | --- |
| `Lang` | 公告、轮播按这个语言取，例如 `zh-CN` |
| `Address` | 当前钱包地址。传了就必须和登录地址一致，否则 401 |

成功时 HTTP 200，响应体是 JSON。失败时响应体是纯文本，不是 JSON。

| HTTP | 含义 |
| --- | --- |
| 400 | 业务错误，正文是提示文案 |
| 401 | 未登录、签名不对、地址不一致、账号被封禁 |
| 404 | 资源不存在 |
| 422 | 参数校验失败，正文是第一条错误 |
| 500 | 服务器错误 |

金额除特别说明外都是去掉尾部 0 的十进制字符串。链上签名里的金额是 18 位小数的最小单位字符串。

分页参数：`page_no` 从 1 开始，`page_size` 为 1 到 20。列表不返回总条数。

## 登录

`POST /auth/login` 无需登录。

用钱包对消息 `Login-{timestamp}` 做 personal_sign。`timestamp` 是当前 Unix 秒，不能早于服务器时间 60 秒。

```json
{
  "address": "0x...",
  "signature": "0x...",
  "timestamp": 1760000000,
  "ref": ""
}
```

`ref` 是邀请码。系统里已经有用户时，新地址必须带有效邀请码。

```json
{ "token": "..." }
```

## 用户

### 我的信息

`GET /users/my` 需要登录。

```json
{
  "id": 1,
  "address": "0x...",
  "team_count": 0,
  "kpi": "0",
  "team_kpi": "0",
  "team_cards": [
    { "id": 1, "name": "10USDT激活卡", "num": 0, "holder_count": 0 },
    { "id": 2, "name": "20USDT激活卡", "num": 0, "holder_count": 0 },
    { "id": 3, "name": "30USDT激活卡", "num": 0, "holder_count": 0 }
  ],
  "referral_code": "邀请码",
  "referral_count": 0,
  "valid_referral_count": 0,
  "usdt_balance": "0"
}
```

`valid_referral_count` 是直推里下过预约单、且订单不是待支付或已过期的人数。

`team_cards` 按每种上架激活卡返回团队持有统计，不包含本人。每项的 `id`、`name` 是激活卡 ID 和名称，`num` 是团队持有该卡的总张数，`holder_count` 是团队持有该卡的人数。即使没有团队成员持有，该卡仍会返回，`num` 和 `holder_count` 均为 `0`。这些数值直接使用后端汇总，不使用个人持卡数量或分页直推列表计算。

### 修改资料

`POST /users/my` 需要登录。字段都可选。

```json
{
  "avatar_url": "https://.../uploads/...",
  "name": "昵称"
}
```

`avatar_url` 必须是上传接口返回的地址，最长 255。`name` 最长 32。返回字段和「我的信息」相同。

### 直推列表

`GET /users/my/referrals?page_no=1&page_size=20` 需要登录。

```json
{
  "referrals": [
    {
      "id": 2,
      "address": "0x7ea...f00a",
      "team_count": 0,
      "kpi": "0",
      "team_kpi": "0",
      "referral_code": "",
      "referral_count": 0,
      "created_at": "2026-10-22 12:00:00"
    }
  ]
}
```

`address` 是脱敏地址，前 5 位加 `...` 加后 4 位。

### 余额流水

`GET /users/my/balance_logs?page_no=1&page_size=20&ccy=usdt_balance` 需要登录。

`ccy` 目前只能传 `usdt_balance`。

```json
{
  "list": [
    {
      "id": 1,
      "is_inc": 1,
      "amount": "10",
      "content": "层级奖励",
      "created_at": "2026-10-22 12:00:00"
    }
  ]
}
```

`is_inc`：1 增加，0 减少。

## 公告和轮播

不需要登录。语言看请求头 `Lang`。

### 公告列表

`GET /notices?page_no=1&page_size=20`

```json
{
  "notices": [
    {
      "id": 1,
      "title": "",
      "content": "",
      "updated_at": "2026-10-22 12:00:00"
    }
  ]
}
```

### 公告详情

`GET /notices/{id}`

返回单条公告，字段同上，没有外层包裹。

### 弹窗公告

`GET /notices/pop`

```json
{
  "is_show": true,
  "notice": {
    "id": 1,
    "title": "",
    "content": "",
    "updated_at": "2026-10-22 12:00:00"
  }
}
```

没有可弹公告时 `notice` 为 `null`，`is_show` 为 `false`。

### 标记已读

`GET /notices/{id}/read`

已登录时记为已读。返回 `{}`。

### 轮播

`GET /banners`

```json
{
  "banners": [
    { "id": 1, "img_url": "https://..." }
  ]
}
```

## 上传

`POST /uploads` 不需要登录。`multipart/form-data`，字段名 `upload`。只接受 jpg、jpeg、png，最大 20MB。

```json
{
  "url": "https://.../uploads/20261022/xxx.jpg",
  "path": "/uploads/20261022/xxx.jpg"
}
```

修改头像时把 `url` 传给 `avatar_url`。

## 公共配置

`GET /config/config` 不需要登录。当前返回 `{}`。

## 预约

合约：`DiscoProject.joinQueue(uint256 id, uint256 usdtAmount, address recipient, uint256 deadline, bytes signature)`

### 预约配置

`GET /reserves/config` 不需要登录。

```json
{
  "disco_price": "0.000997499900499384",
  "list": [
    {
      "round_id": 1,
      "name": "",
      "days": 5,
      "daily_rate": "20",
      "amounts": [
        {
          "amount_id": 1,
          "amount": "100",
          "card_id": 1,
          "card_name": "",
          "card_amount": "10"
        }
      ]
    }
  ]
}
```

只返回上架的场次和档位。`disco_price` 是 1 DISCO 兑换的 USDT 数量。

### 预约列表

`GET /reserves?page_no=1&page_size=20&status=3` 需要登录。

`status` 可选，按页签分组：

| 传参 | 页签 | 实际订单状态 |
| --- | --- | --- |
| 3 | 排队中 | 3 |
| 4 或 5 | 进行中 | 4 发币中、5 进行中 |
| 6 或 7 | 卖出中 | 6 卖出中、7 卖出链上提交中 |
| 8 | 已完成 | 8 |

不传 `status` 返回全部。待支付 1、已过期 2 不能作为筛选值。

```json
{
  "list": [
    {
      "id": 1,
      "round_id": 1,
      "round_name": "",
      "amount_id": 1,
      "amount": "100",
      "card_id": 1,
      "card_name": "",
      "days": 5,
      "passed_days": 0,
      "daily_rate": "20",
      "disco_price": "0",
      "token_amount": "0",
      "expect_token_amount": "0",
      "profit_amount": "0",
      "reduced_profit": "0",
      "rise_rate": "0",
      "remain_profit": "0",
      "can_sell": false,
      "status": 3,
      "token_status": 1,
      "sell_status": 1,
      "tx_hash": "",
      "running_at": "",
      "selling_at": "",
      "sell_usdt_amount": "0",
      "sell_user_amount": "0",
      "sell_leader_amount": "0",
      "sold_at": "",
      "paid_at": "",
      "created_at": "2026-10-22 12:00:00"
    }
  ]
}
```

订单状态：1 待支付，2 已过期，3 排队中，4 发币中，5 进行中，6 卖出中，7 卖出链上提交中，8 已完成。

`token_status`、`sell_status`：1 未提交，2 提交中，3 提交成功。

`can_sell` 为 true 时可以调用卖出。`expect_token_amount` 是还没发币时按当前币价估算的代币数量。`remain_profit` 是当前可卖出的 USDT 收益。

### 创建预约

`POST /reserves` 需要登录。会扣 1 张对应激活卡。资金功能关闭时返回 400。

```json
{ "amount_id": 1 }
```

```json
{
  "id": 1,
  "amount": "100000000000000000000",
  "recipient": "0x...",
  "deadline": 1760000090,
  "sign": "0x..."
}
```

`amount` 是 USDT 最小单位。`deadline` 是 Unix 秒，90 秒后过期。前端用这些参数调用 `joinQueue`。链上成功后订单变为排队中；超时未支付变为已过期，激活卡退回。

### 卖出

`POST /reserves/sell` 需要登录。只有卖出中且剩余收益大于 0 的订单可以卖。

```json
{ "id": 1 }
```

```json
{
  "id": 1,
  "token_amount": "1000000000000000000",
  "usdt_amount": "85000000000000000000",
  "leader_address": "0x0000000000000000000000000000000000000000",
  "leader_amount": "0",
  "deadline": 1760000090,
  "sign": "0x..."
}
```

合约：`DiscoProject.sellDisco(uint256 id, uint256 discoAmount, uint256 usdtAmount, address rewardRecipient, uint256 rewardUsdtAmount, uint256 deadline, bytes signature)`

| 返回字段 | 合约参数 |
| --- | --- |
| `id` | `id` |
| `token_amount` | `discoAmount`，扣掉的 DISCO 最小单位 |
| `usdt_amount` | `usdtAmount`，用户实际到账的 USDT 最小单位 |
| `leader_address` | `rewardRecipient` |
| `leader_amount` | `rewardUsdtAmount` |
| `deadline` | `deadline` |
| `sign` | `signature` |

没有团队长时 `leader_address` 为 0 地址，`leader_amount` 为 `"0"`。签名 90 秒有效。

## 激活卡

合约：`DiscoProject.buyCard(uint256 id, uint256 usdtAmount, address recipient, uint256 deadline, bytes signature)`

### 卡列表

`GET /activation_cards` 需要登录。只返回上架的卡，并带上当前用户持有数量。

```json
{
  "list": [
    { "id": 1, "name": "10USDT激活卡", "amount": "0.01", "num": 0 }
  ]
}
```

`amount` 为当前 USDT 单价。前端直接使用接口返回的卡列表、`name`、`amount`、`num` 和 `id`，不固定业务名称或价格；本地只配置封面资源，按接口列表顺序使用。购买和转赠使用接口返回的真实 `id`。

### 变动记录

`GET /activation_cards/logs?page_no=1&page_size=20&card_id=1` 需要登录。`card_id` 可选。

```json
{
  "list": [
    {
      "id": 1,
      "card_id": 1,
      "card_name": "",
      "amount": "10",
      "is_inc": 1,
      "num": 1,
      "after_num": 1,
      "content": "购买激活卡",
      "from_address": "",
      "created_at": "2026-10-22 12:00:00"
    }
  ]
}
```

`is_inc`：1 增加，0 减少。`from_address` 是赠送对方地址，没有则为空。

### 购买

`POST /activation_cards/buy` 需要登录。

```json
{ "card_id": 1, "num": 1 }
```

`num` 为 1 到 1000000。支付总额是卡单价乘数量。

```json
{
  "id": 1,
  "card_id": 1,
  "num": 1,
  "amount": "10000000000000000000",
  "recipient": "0x...",
  "deadline": 1760000090,
  "sign": "0x..."
}
```

`amount` 是 USDT 最小单位。前端调用 `buyCard(id, amount, recipient, deadline, sign)`。链上成功后发卡。90 秒内未支付，订单过期，不发卡。

### 赠送

`POST /activation_cards/gift` 需要登录。

钱包签署 `Transfer-{timestamp}`，`timestamp` 使用当前 Unix 秒，与登录签名采用相同方式。

```json
{
  "address": "0x...",
  "card_id": 1,
  "num": 1,
  "signature": "0x...",
  "timestamp": 1760000000
}
```

`num` 不传时为 1，最大 1000000。不能赠送给自己。成功返回 `{}`。

## 提现

提现由服务端提交链上转账，前端不用签名。

### 提现配置

`GET /withdraws/config` 不需要登录。

```json
{
  "fee_rate": "5",
  "min_amount": "10",
  "free_audit_amount": "0"
}
```

比例是百分数。`free_audit_amount` 为 0 表示没有免审额度。

### 发起提现

`POST /withdraws` 需要登录。每天只能有一笔未拒绝的提现。资金功能关闭时返回 400。

```json
{ "amount": "100" }
```

`amount` 是扣除的 USDT 数量，不是最小单位。到账金额是扣除手续费后的数量。

```json
{
  "withdraw": {
    "id": 1,
    "ccy": "usdt",
    "address": "0x...",
    "amount": "100",
    "fee_rate": "5",
    "fee": "5",
    "actual_amount": "95",
    "audit_status": 1,
    "reject_reason": "",
    "withdraw_status": 1,
    "tx_hash": "",
    "expired_at": "",
    "submitted_at": "",
    "audited_at": "",
    "succeed_at": "",
    "created_at": "2026-10-22 12:00:00"
  },
  "balance": "0"
}
```

`audit_status`：1 审核中，2 通过，3 拒绝。`withdraw_status`：1 未提交，2 提现中，3 成功。拒绝会退回全部扣除金额。

### 提现记录

`GET /withdraws?page_no=1&page_size=20` 需要登录。

可选筛选：`audit_status` 为 1、2、3，`withdraw_status` 为 1、2、3。

```json
{
  "list": []
}
```

列表项字段和发起提现里的 `withdraw` 相同。
