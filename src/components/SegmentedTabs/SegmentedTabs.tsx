import { useEffect, useRef, type ComponentPropsWithoutRef, type KeyboardEvent, type ReactNode } from 'react'

import './SegmentedTabs.scss'

export interface SegmentedTabOption<T extends string = string> {
    label: ReactNode
    value: T
    disabled?: boolean
    id?: string
    panelId?: string
}

export interface SegmentedTabsProps<T extends string = string> extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange' | 'style'> {
    options: readonly SegmentedTabOption<T>[]
    value: T
    onChange: (value: T) => void
    ariaLabel?: string
    variant?: 'segmented' | 'pills'
}

function scrollTabHorizontally(container: HTMLDivElement | null, button: HTMLButtonElement | null | undefined) {
    if (!container || !button || container.clientWidth <= 0) return

    const viewportLeft = container.getBoundingClientRect().left + container.clientLeft
    const viewportRight = viewportLeft + container.clientWidth
    const buttonRect = button.getBoundingClientRect()
    const delta = buttonRect.width > container.clientWidth || buttonRect.left < viewportLeft
        ? buttonRect.left - viewportLeft
        : buttonRect.right > viewportRight ? buttonRect.right - viewportRight : 0
    if (delta === 0) return

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
    const nextScrollLeft = Math.max(0, Math.min(maxScrollLeft, container.scrollLeft + delta))
    if (nextScrollLeft !== container.scrollLeft) container.scrollLeft = nextScrollLeft
}

export function SegmentedTabs<T extends string = string>({ options, value, onChange, ariaLabel, variant = 'segmented', className = '', ...tabsProps }: SegmentedTabsProps<T>) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
    if (options.length < 2 || options.length > 5) throw new Error('SegmentedTabs supports 2 to 5 options')
    if (new Set(options.map((option) => option.value)).size !== options.length) throw new Error('SegmentedTabs values must be unique')
    const activeIndex = options.findIndex((option) => option.value === value)
    const focusIndex = activeIndex >= 0 && !options[activeIndex].disabled
        ? activeIndex : options.findIndex((option) => !option.disabled)

    useEffect(() => {
        if (variant === 'pills') scrollTabHorizontally(containerRef.current, buttonRefs.current[activeIndex])
    }, [activeIndex, options, variant])

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
        event.preventDefault()
        const enabled = options.map((option, i) => option.disabled ? -1 : i).filter((i) => i >= 0)
        if (enabled.length === 0) return
        const current = enabled.indexOf(index)
        const nextIndex = event.key === 'Home' ? enabled[0]
            : event.key === 'End' ? enabled[enabled.length - 1]
            : enabled[(current + (event.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length]
        if (variant === 'pills') {
            buttonRefs.current[nextIndex]?.focus({ preventScroll: true })
            scrollTabHorizontally(containerRef.current, buttonRefs.current[nextIndex])
        } else {
            buttonRefs.current[nextIndex]?.focus()
        }
        onChange(options[nextIndex].value)
    }

    return (
        <div {...tabsProps} ref={containerRef} className={['segmented-tabs', `segmented-tabs--count-${options.length}`, `segmented-tabs--active-${activeIndex}`, variant === 'pills' ? 'segmented-tabs--pills' : '', className].filter(Boolean).join(' ')} role="tablist" aria-label={ariaLabel}>
            {variant === 'segmented' && activeIndex >= 0 ? <div className="segmented-tabs__indicator" /> : null}
            {options.map((option, index) => (
                <button type="button" role="tab" aria-selected={option.value === value} disabled={option.disabled}
                    id={option.id} aria-controls={option.panelId}
                    tabIndex={focusIndex === index ? 0 : -1}
                    ref={(element) => { buttonRefs.current[index] = element }}
                    className={['segmented-tabs__tab', 'flex-center size-28', variant === 'pills' ? 'bold-5' : 'bold-7', option.value === value ? 'segmented-tabs__tab--active' : 'segmented-tabs__tab--inactive', option.disabled ? 'opc-5' : ''].join(' ')}
                    onClick={() => { if (!option.disabled) onChange(option.value) }}
                    onKeyDown={(event) => handleKeyDown(event, index)} key={option.value}>
                    {option.label}
                </button>
            ))}
        </div>
    )
}
