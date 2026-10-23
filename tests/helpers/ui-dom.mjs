import { readFileSync, existsSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { Window } from 'happy-dom'
import ts from 'typescript'
import { act } from 'react'
import { createRoot } from 'react-dom/client'

export function installUiDom() {
    const window = new Window({ url: 'https://example.test/' })
    for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent', 'DOMParser']) {
        Object.defineProperty(globalThis, name, { value: name === 'window' ? window : window[name], configurable: true, writable: true })
    }
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    const hooks = registerHooks({
        resolve(specifier, context, nextResolve) {
            if (specifier.startsWith('@/')) {
                let path = resolve('src', specifier.slice(2))
                if (!existsSync(path)) {
                    path = ['.ts', '.tsx', '/index.ts', '/index.tsx'].map((suffix) => path + suffix).find(existsSync) ?? path
                } else if (!/\.[a-z]+$/i.test(path)) path += '/index.ts'
                return nextResolve(pathToFileURL(path).href, context)
            }
            if (specifier.startsWith('.') && context.parentURL && !/\.[a-z]+$/i.test(specifier)) {
                const base = fileURLToPath(new URL(specifier, context.parentURL))
                const path = ['.ts', '.tsx', '/index.ts', '/index.tsx'].map((suffix) => base + suffix).find(existsSync)
                if (path) return nextResolve(pathToFileURL(path).href, context)
            }
            return nextResolve(specifier, context)
        },
        load(url, context, nextLoad) {
            if (/\.(scss|css|png|svg|webp|jpe?g|gif)$/.test(url)) return { format: 'module', shortCircuit: true, source: `export default ${JSON.stringify(url)}` }
            if (url.endsWith('.tsx')) {
                return { format: 'module', shortCircuit: true, source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
                    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
                }).outputText }
            }
            return nextLoad(url, context)
        },
    })
    return { window, dispose: () => { hooks.deregister(); window.happyDOM.abort() } }
}

export async function mount(element) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => root.render(element))
    return {
        container,
        render: async (next) => { await act(async () => root.render(next)) },
        unmount: async () => { await act(async () => root.unmount()); container.remove() },
    }
}

export function deferred() {
    let resolvePromise, rejectPromise
    const promise = new Promise((resolve, reject) => { resolvePromise = resolve; rejectPromise = reject })
    return { promise, resolve: resolvePromise, reject: rejectPromise }
}

export function installWindowTimers(window) {
    const previous = { setTimeout: window.setTimeout, clearTimeout: window.clearTimeout }
    let id = 0
    const pending = new Map()
    window.setTimeout = (callback) => { pending.set(++id, callback); return id }
    window.clearTimeout = (timer) => pending.delete(timer)
    return {
        pending,
        async flush() {
            for (let cycle = 0; cycle < 8 && pending.size > 0; cycle++) {
                const callbacks = [...pending.values()]
                pending.clear()
                await act(async () => { for (const callback of callbacks) callback(); await Promise.resolve() })
            }
        },
        restore() { Object.assign(window, previous) },
    }
}
