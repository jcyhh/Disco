import { Icon } from '../Icon/index.ts'
import type { MessageType } from './message.ts'

export interface MessageToastProps {
    message: string
    type: MessageType
    isLeaving?: boolean
    onClose: () => void
}

export function MessageToast({ message, type, isLeaving = false, onClose }: MessageToastProps) {
    return (
        <div className={['message-toast', `message-toast--${type}`, 'animate__animated ani-5', isLeaving ? 'animate__fadeOut' : 'animate__fadeIn'].join(' ')} role="status" aria-live="polite">
            <div className="message-toast__box flex items-center pt-24 pr-26 pb-24 pl-26">
                <span className="message-toast__text flex-1 size-24 lh-34 word-break">{message}</span>
                <button className="message-toast__close flex-center ml-20 flex-none" type="button" aria-label="Close message" onClick={onClose}>
                    <Icon name="cross" className="size-24" />
                </button>
            </div>
        </div>
    )
}
