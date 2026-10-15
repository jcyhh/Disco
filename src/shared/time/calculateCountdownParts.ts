import { formatTwoDigitNumber } from '../formatters/formatTwoDigitNumber.ts'

export type CountdownTimeValue = string | number | Date | null | undefined

export const COUNTDOWN_UNIT = {
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
} as const

export type CountdownUnit =
    (typeof COUNTDOWN_UNIT)[keyof typeof COUNTDOWN_UNIT]

export type CountdownParts = Record<CountdownUnit, string>

export type CalculateCountdownPartsParams = {
    targetTime: CountdownTimeValue
    now?: CountdownTimeValue
}

const ZERO_COUNTDOWN_PARTS: CountdownParts = {
    [COUNTDOWN_UNIT.days]: '00',
    [COUNTDOWN_UNIT.hours]: '00',
    [COUNTDOWN_UNIT.minutes]: '00',
    [COUNTDOWN_UNIT.seconds]: '00',
}

function toDate(value: CountdownTimeValue): Date {
    if (value === null || value === undefined || value === '') return new Date(Number.NaN)

    return value instanceof Date ? new Date(value) : new Date(value)
}

export function calculateCountdownParts({
    targetTime,
    now = new Date(),
}: CalculateCountdownPartsParams): CountdownParts {
    const targetDate = toDate(targetTime)
    const nowDate = toDate(now)

    if (Number.isNaN(targetDate.getTime()) || Number.isNaN(nowDate.getTime())) {
        return ZERO_COUNTDOWN_PARTS
    }

    let totalSeconds = Math.max(
        Math.floor((targetDate.getTime() - nowDate.getTime()) / 1000),
        0,
    )
    const days = Math.floor(totalSeconds / 86400)
    totalSeconds -= days * 86400
    const hours = Math.floor(totalSeconds / 3600)
    totalSeconds -= hours * 3600
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds - minutes * 60

    return {
        [COUNTDOWN_UNIT.days]: formatTwoDigitNumber(days),
        [COUNTDOWN_UNIT.hours]: formatTwoDigitNumber(hours),
        [COUNTDOWN_UNIT.minutes]: formatTwoDigitNumber(minutes),
        [COUNTDOWN_UNIT.seconds]: formatTwoDigitNumber(seconds),
    }
}
