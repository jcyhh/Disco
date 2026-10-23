import test from 'node:test'
import assert from 'node:assert/strict'
import ts from 'typescript'

// Unused @ts-expect-error directives fail this check if ABI validation regresses.
test('contract wrappers infer returns and reject invalid ABI methods, arguments and mutability', () => {
    const config = ts.readConfigFile('tsconfig.app.json', ts.sys.readFile)
    assert.equal(config.error, undefined)
    const { options, fileNames } = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd())
    const program = ts.createProgram(['tests/types/dapp-contracts.ts', ...fileNames.filter((file) => file.endsWith('.d.ts'))], { ...options, strict: true, noEmit: true })
    const errors = ts.getPreEmitDiagnostics(program)
    const output = ts.formatDiagnosticsWithColorAndContext(errors, {
        getCurrentDirectory: () => process.cwd(),
        getCanonicalFileName: (name) => name,
        getNewLine: () => '\n',
    })
    assert.equal(errors.length, 0, output)
})
