import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { installUiDom, deferred } from './helpers/ui-dom.mjs'

const dom = installUiDom()
after(() => dom.dispose())
const { loadHome } = await import('../src/pages/main/home/service.ts')
const { httpClient } = await import('../src/services/http/client.ts')
const { message } = await import('../src/components/Message/message.ts')
const required = {
    '/api/banners': { banners: [{ id: 1, img_url: '/banner.webp' }] },
    '/api/notices': { notices: [{ id: 2, title: 'Notice', content: '' }] },
    '/api/reserves/config': { list: [{ round_id: 3, amounts: [] }] },
    '/api/notices/pop': { is_show: false, notice: null },
}

for (const outcome of ['success', 'failure', 'abort']) {
    test(`home data resolves before background public config (${outcome})`, async () => {
        const previousAdapter = httpClient.defaults.adapter
        const previousWarning = message.warning
        const publicRequest = deferred()
        const controller = new AbortController()
        const requests = []
        let publicSignal, loaded = false
        message.warning = () => {}
        httpClient.defaults.adapter = async (config) => {
            requests.push(config.url)
            let data = required[config.url]
            if (config.url === '/api/config/config') {
                publicSignal = config.signal
                data = await publicRequest.promise
            } else assert.ok(data, `Unexpected request: ${config.url}`)
            return { data, status: 200, statusText: 'OK', headers: {}, config }
        }
        try {
            const pending = loadHome(controller.signal).then((data) => { loaded = true; return data })
            await new Promise((resolve) => setImmediate(resolve))
            assert.equal(loaded, true, 'an unresolved optional request must not hold home data')
            const data = await pending
            assert.deepEqual(data.banners, required['/api/banners'].banners)
            assert.equal(data.reserves.list[0].round_id, 3)
            assert.equal(requests.length, 5)
            if (outcome === 'abort') {
                controller.abort()
                assert.equal(publicSignal.aborted, true)
            }
            if (outcome === 'failure') publicRequest.reject(new Error('Optional config unavailable'))
            else publicRequest.resolve({})
            await new Promise((resolve) => setImmediate(resolve))
            assert.equal(loaded, true)
        } finally {
            controller.abort()
            publicRequest.resolve({})
            httpClient.defaults.adapter = previousAdapter
            message.warning = previousWarning
        }
    })
}
