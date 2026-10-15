# Project terminology
# 项目术语规范

This file records user-facing business terms that AI and engineers must follow.
本文件记录 AI 和工程师必须遵守的前台业务术语。

When a Figma design, old project habit or API field name conflicts with this glossary, source code and UI copy must follow this glossary.
当 Figma 设计稿、旧项目习惯或接口字段名与本词表冲突时，源码和 UI 文案必须以本词表为准。

Record the mismatch in implementation notes or feedback docs instead of copying the wrong term into UI source.
不要把错误术语照搬进 UI 源码，应在实现说明或反馈文档中记录差异。

## Banned terms
## 禁用词

| Banned term | Use instead | Scope | Reason |
| --- | --- | --- | --- |
| 提现 | 提取 | User-facing UI copy | Only replace the banned term `提现`. Keep valid business words such as `领取`, `赎回` and `取回` when they are used intentionally. |
| 提现 | 提取 | 面向用户的 UI 文案 | 只替换禁用词 `提现`。如果业务本身使用 `领取`、`赎回`、`取回` 等正确文案，不要强行替换。 |

## How to use this file
## 使用方式

Before implementing a page from Figma, check this file before copying visible text.
根据 Figma 开发页面前，复制可见文案前先检查本文件。

If a design uses a banned term, replace it with the approved term in code.
如果设计稿使用了禁用词，代码中必须替换为推荐术语。

Only replace the banned term `提现`.
只替换禁用词 `提现`。

Do not replace valid business words such as `领取`, `赎回` or `取回` unless they are themselves added to the banned list later.
不要替换 `领取`、`赎回` 或 `取回` 这类有效业务词，除非后续它们也被加入禁用词表。

If a project needs a different wording later, update this file first, then update UI code and tests.
如果后续项目确认改用其他说法，先更新本文件，再修改 UI 代码和测试。
