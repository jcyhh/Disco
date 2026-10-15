import noDuplicateUtilityDeclarations from './scripts/stylelint/noDuplicateUtilityDeclarations.mjs'
import requireDynamicViewportPair from './scripts/stylelint/requireDynamicViewportPair.mjs'

export default {
    customSyntax: 'postcss-scss',
    ignoreFiles: [
        'node_modules/**',
        'src/vendor/**',
        'src/third-party/**',
    ],
    plugins: [
        noDuplicateUtilityDeclarations,
        requireDynamicViewportPair,
    ],
    rules: {
        'template/no-duplicate-utility-declarations': true,
        'template/require-dynamic-viewport-pair': true,
    },
}
