import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { useEffect, useRef } from 'react'

import './InfiniteScroll.scss'

export interface InfiniteScrollProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'style' | 'onError'> {
    children: ReactNode
    loading: boolean
    hasMore: boolean
    onLoadMore: () => void | Promise<void>
    onError?: (error: unknown) => void
    disabled?: boolean
    rootMargin?: string
    sentinelClassName?: string
}

function getScrollParent(element: HTMLElement | null): HTMLElement | null {
    let node = element?.parentElement ?? null
    while (node && node !== document.body) {
        const { overflowY } = window.getComputedStyle(node)
        if (['auto', 'scroll', 'overlay'].includes(overflowY)) return node
        node = node.parentElement
    }
    return null
}

export function InfiniteScroll({ children, loading, hasMore, onLoadMore, onError, disabled = false,
    rootMargin = '0px 0px 120px', sentinelClassName = '', className = '', ...scrollProps
}: InfiniteScrollProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const stateRef = useRef({ loading, hasMore, disabled, onLoadMore, onError })
    const loadMoreLockRef = useRef(false)
    const generationRef = useRef(0)
    stateRef.current = { loading, hasMore, disabled, onLoadMore, onError }

    useEffect(() => {
        const generation = ++generationRef.current
        return () => {
            if (generation === generationRef.current) generationRef.current += 1
            loadMoreLockRef.current = false
        }
    }, [])

    useEffect(() => {
        const sentinel = sentinelRef.current
        const container = containerRef.current
        if (!sentinel || !container || typeof IntersectionObserver === 'undefined') return
        let observing = true
        const observer = new IntersectionObserver((entries) => {
            const state = stateRef.current
            if (!observing || !entries.some((entry) => entry.isIntersecting)
                || state.loading || !state.hasMore || state.disabled || loadMoreLockRef.current) return

            loadMoreLockRef.current = true
            const generation = generationRef.current
            void (async () => {
                try {
                    await state.onLoadMore()
                } catch (error) {
                    if (generation === generationRef.current) {
                        try { stateRef.current.onError?.(error) } catch { /* Error observers cannot break the loading lifecycle. */ }
                    }
                } finally {
                    if (generation === generationRef.current) loadMoreLockRef.current = false
                }
            })()
        }, { root: getScrollParent(container), rootMargin, threshold: 0 })
        observer.observe(sentinel)
        return () => {
            observing = false
            observer.disconnect()
        }
    }, [disabled, hasMore, loading, rootMargin])

    return (
        <div {...scrollProps} ref={containerRef} className={['infinite-scroll', className].filter(Boolean).join(' ')}>
            {children}
            <div ref={sentinelRef} className={['infinite-scroll__sentinel', sentinelClassName].filter(Boolean).join(' ')} aria-hidden="true" />
        </div>
    )
}
