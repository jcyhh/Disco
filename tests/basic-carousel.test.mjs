import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { createElement } from 'react'
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { transform } from 'esbuild'

const source = await readFile(new URL('../src/components/Carousel/BasicCarousel.tsx', import.meta.url), 'utf8')
const compiled = await transform(source, { loader: 'tsx', jsx: 'automatic', format: 'esm' })
const require = createRequire(import.meta.url)
let code = compiled.code.replaceAll(/^import ["'](?:[^"']+\.s?css|swiper\/css)["'];?\n/gm, '')
for (const dependency of ['react/jsx-runtime', 'react', 'swiper/modules', 'swiper/react']) {
    code = code.replaceAll(JSON.stringify(dependency), JSON.stringify(pathToFileURL(require.resolve(dependency)).href))
}
const { BasicCarousel } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)

test('basic carousel defaults to horizontal slides with automatic height and continued autoplay', () => {
    const carousel = BasicCarousel({
        children: [createElement('div', { key: 'first' }, 'First'), createElement('div', { key: 'second' }, 'Second')],
    })

    assert.equal(carousel.type, Swiper)
    assert.equal(carousel.props.direction, 'horizontal')
    assert.equal(carousel.props.autoHeight, true)
    assert.equal(carousel.props.loop, true)
    assert.deepEqual(carousel.props.modules, [Autoplay])
    assert.deepEqual(carousel.props.autoplay, { delay: 3000, disableOnInteraction: false })
})

test('vertical carousel passes its direction and page class while disabling automatic height', () => {
    const carousel = BasicCarousel({
        direction: 'vertical',
        className: 'home-page__announcements',
        children: ['First', 'Second'],
    })

    assert.equal(carousel.props.direction, 'vertical')
    assert.equal(carousel.props.autoHeight, false)
    assert.ok(carousel.props.className.split(' ').includes('carousel'))
    assert.ok(carousel.props.className.split(' ').includes('carousel--vertical'))
    assert.ok(carousel.props.className.split(' ').includes('home-page__announcements'))
    assert.equal(carousel.props.loop, true)
    assert.deepEqual(carousel.props.autoplay, { delay: 3000, disableOnInteraction: false })
})

test('empty and single-slide carousels do not enable loop or autoplay', () => {
    for (const direction of ['horizontal', 'vertical']) {
        for (const children of [null, [], createElement('div', null, 'Only slide')]) {
            const carousel = BasicCarousel({ direction, children })
            assert.equal(carousel.props.loop, false)
            assert.equal(carousel.props.autoplay, false)
        }
    }
})

test('each supplied child keeps its content and local interaction in a slide', () => {
    const onClick = () => 'clicked'
    const carousel = BasicCarousel({
        children: [
            createElement('button', { key: 'action', type: 'button', onClick }, 'Details'),
            null,
            false,
            createElement('a', { key: 'link', href: '/destination' }, 'Destination'),
        ],
    })

    assert.equal(carousel.props.children.length, 2)
    const [actionSlide, linkSlide] = carousel.props.children
    assert.equal(actionSlide.type, SwiperSlide)
    assert.equal(linkSlide.type, SwiperSlide)
    const action = actionSlide.props.children.props.children
    assert.equal(action.type, 'button')
    assert.equal(action.props.children, 'Details')
    assert.equal(action.props.onClick, onClick)
    const link = linkSlide.props.children.props.children
    assert.equal(link.type, 'a')
    assert.equal(link.props.href, '/destination')
    assert.equal(link.props.children, 'Destination')
})
