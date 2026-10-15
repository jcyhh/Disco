import { useEffect, useState, type ComponentPropsWithoutRef } from 'react'

import {
    calculateCountdownParts,
    type CountdownTimeValue,
} from '../../shared/time/calculateCountdownParts.ts'
import { getVisibleCountdownUnits } from './config.ts'

import './CountdownTimer.scss'

export interface CountdownTimerProps extends Omit<
    ComponentPropsWithoutRef<'div'>,
    'children' | 'style'
> {
    targetTime: CountdownTimeValue
    now?: CountdownTimeValue
}

export function CountdownTimer({
    targetTime,
    now,
    className = '',
    ...countdownProps
}: CountdownTimerProps) {
    const [currentTime, setCurrentTime] = useState<CountdownTimeValue>(
        () => now ?? new Date(),
    )
    const countdownParts = calculateCountdownParts({
        targetTime,
        now: currentTime,
    })
    const visibleUnits = getVisibleCountdownUnits(countdownParts)
    const countdownClassName = [
        'app-countdown-timer',
        'flex-center',
        className,
    ].filter(Boolean).join(' ')

    useEffect(() => {
        if (now !== undefined) {
            setCurrentTime(now)
            return undefined
        }

        setCurrentTime(new Date())
        const timer = window.setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => {
            window.clearInterval(timer)
        }
    }, [now])

    return (
        <div {...countdownProps} className={countdownClassName}>
            {visibleUnits.map((unit, index) => (
                <div className="app-countdown-timer__item flex-center" key={unit}>
                    <span className="app-countdown-timer__unit flex-center size-32 bold-7">
                        {countdownParts[unit]}
                    </span>
                    {index < visibleUnits.length - 1 ? (
                        <span className="app-countdown-timer__separator size-32 bold-7">
                            :
                        </span>
                    ) : null}
                </div>
            ))}
        </div>
    )
}
