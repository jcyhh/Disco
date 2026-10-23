import { useLayoutEffect, useRef } from 'react'

const REVEAL_SELECTOR = '[data-reveal]'
const WAITING_CLASS = 'page-reveal--waiting'
const VISIBLE_CLASS = 'page-reveal--visible'
const IMMEDIATE_CLASS = 'page-reveal--immediate'

/** Reveal page content once, including asynchronously inserted list items. */
export function usePageReveal<T extends HTMLElement>() {
    const pageRef = useRef<T>(null)

    useLayoutEffect(() => {
        const page = pageRef.current
        if (!page || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

        const registered = new Set<Element>()
        let active = true
        let observer: IntersectionObserver | undefined

        function reveal(element: Element, immediate = false) {
            element.classList.remove(WAITING_CLASS)
            element.classList.add(VISIBLE_CLASS)
            if (immediate) element.classList.add(IMMEDIATE_CLASS)
            observer?.unobserve(element)
        }

        if (typeof IntersectionObserver !== 'undefined') {
            observer = new IntersectionObserver((entries) => {
                if (!active) return
                for (const entry of entries) {
                    if (entry.isIntersecting && registered.has(entry.target)) reveal(entry.target)
                }
            }, { threshold: 0.01, rootMargin: '0px 0px -16px 0px' })
        }

        function register(element: Element) {
            if (registered.has(element)) return
            registered.add(element)
            if (observer) {
                element.classList.add(WAITING_CLASS)
                observer.observe(element)
            } else {
                reveal(element)
            }
        }

        function scan(element: Element) {
            if (element.matches(REVEAL_SELECTOR)) register(element)
            element.querySelectorAll(REVEAL_SELECTOR).forEach(register)
        }

        scan(page)
        const mutations = new window.MutationObserver((records) => {
            if (!active) return
            for (const record of records) {
                for (const node of record.removedNodes) {
                    if (!(node instanceof Element)) continue
                    for (const element of registered) {
                        if (node === element || node.contains(element)) {
                            observer?.unobserve(element)
                            registered.delete(element)
                        }
                    }
                }
                for (const node of record.addedNodes) {
                    if (node instanceof Element) scan(node)
                }
            }
        })
        mutations.observe(page, { childList: true, subtree: true })

        function handleFocus(event: FocusEvent) {
            if (!(event.target instanceof Element)) return
            // Keyboard focus must never wait for a decorative entrance animation.
            for (const element of registered) {
                if (element.contains(event.target)) reveal(element, true)
            }
        }
        page.addEventListener('focusin', handleFocus)

        return () => {
            active = false
            observer?.disconnect()
            mutations.disconnect()
            page.removeEventListener('focusin', handleFocus)
            for (const element of registered) {
                element.classList.remove(WAITING_CLASS, VISIBLE_CLASS, IMMEDIATE_CLASS)
            }
        }
    }, [])

    return pageRef
}
