# Internationalization
国际化模块。

The project uses `i18next` and `react-i18next`.
项目使用 `i18next` 和 `react-i18next`。

Chinese text is allowed as the translation key because it matches the team's daily development language.
允许使用中文作为翻译 key，因为这符合团队日常开发语言。

```tsx
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
return <button>{t('确定')}</button>
```

Use `translate()` outside React components.
在 React 组件外使用 `translate()`。

```ts
import { translate } from '@/i18n'

translate('复制成功')
```

Use `changeAppLanguage()` to switch languages.
使用 `changeAppLanguage()` 切换语言。

```ts
await changeAppLanguage('zh-Hant')
```

## Language list
## 语言列表

All enabled languages are defined in `APP_LANGUAGES` inside `config.ts`. New projects enable English, Traditional Chinese and Simplified Chinese by default.
所有启用语言都集中定义在 `config.ts` 的 `APP_LANGUAGES` 中，新项目默认只启用英语、繁体中文和简体中文。

Each item merges shared common copy, shared DApp copy and project copy in that order. Project entries override shared entries.
每个数组项依次合并 common、DApp 和 project 词库，项目词条可以覆盖通用词条。

The template enables i18n by default through `APP_CONFIG.enableI18n`.
模板通过 `APP_CONFIG.enableI18n` 默认开启多语言。

When i18n is enabled, development defaults to `zh-Hans`, and production defaults to `en`.
开启多语言时，开发环境默认 `zh-Hans`，生产环境默认 `en`。

When `enableI18n` is `false`, initialization, local storage and the app store are fixed to `zh-Hans`. Translation calls remain available, but language switching and the request `lang` header are disabled.
当 `enableI18n` 为 `false` 时，初始化、本地缓存和 app store 都固定为 `zh-Hans`。翻译调用仍可正常使用，但语言切换和请求 `lang` 头会关闭。

When a real project does not need a language, remove the whole language item so Vite stops generating that language chunk.
真实项目不需要某种语言时，移除整个语言数组项即可让 Vite 不再生成对应语言 chunk。

Language codes use standard values such as `zh-Hans`, `zh-Hant` and `ms`.
语言代码使用标准值，例如 `zh-Hans`、`zh-Hant` 和 `ms`。

Do not restore legacy custom codes such as `zh`, `hk` or `ma`.
不要恢复旧项目中的 `zh`、`hk` 或 `ma` 这类自定义代码。

## Copy groups
## 文案分类

- `locales/common/*.json`: shared button, status, copy, refresh and time text.
- `locales/common/*.json`：通用按钮、状态、复制、刷新和时间文案。
- `locales/common/dappH5/*.json`: DApp wallet, network, signature, approval, transaction, H5 network, empty state, upload and submit text.
- `locales/common/dappH5/*.json`：DApp 钱包、网络、签名、授权、交易，以及 H5 网络、空状态、上传和提交文案。
- `locales/project/*.json`: project-only copy. Template files start empty; each enabled language loader already merges them.
- `locales/project/*.json`：项目独有文案。模板文件初始为空，启用语言的 loader 已统一接入。
- Do not put one-off business copy into common resources.
- 不要把一次性业务文案加入 common 资源。

Initialization only loads the current language and the English fallback language.
初始化只加载当前语言和英文回退语言。

Other language chunks are loaded dynamically only when the user switches language.
只有用户切换语言时，才动态加载其他语言 chunk。

Language changes are synchronized to localStorage, `<html lang>` and the app store.
语言切换会同步到 localStorage、`<html lang>` 和 app store。

The frontend and backend should use the same standard language codes.
前后端应统一使用同一套标准语言代码。

When i18n is enabled, the request layer reads the current language and sends it through the `lang` request header.
开启多语言时，请求层会读取当前语言，并通过 `lang` 请求头传给后端。

Optional locale resources remain in the repository. To enable another language, add an `APP_LANGUAGES` item with its standard code and the same three imports used by the default languages. Missing project entries use the English fallback through i18next.
其他可选语言资源继续保留在仓库中。启用时，在 `APP_LANGUAGES` 增加标准语言代码并复用默认语言的三个词库导入。项目词条缺失时由 i18next 使用英文回退。

`translate()` is safe before initialization and returns the supplied key until resources are ready. Shared components, formatters and service errors use shared resources; never copy business-specific project dictionaries back into this template.
`translate()` 在初始化前可安全调用，资源未就绪时返回传入的 key。通用组件、格式化工具和服务错误使用公共词库，不要把业务专属项目词库回灌模板。
