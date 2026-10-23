import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Popup } from '@/components/Popup'
import { NoticeContent } from '@/components/NoticeContent/NoticeContent.tsx'
import { useApiMutation } from '@/hooks/useApiMutation.ts'

import type { Notice, PopNoticeResponse } from './types.ts'
import { markNoticeRead } from './api.ts'
import './HomeNoticePopup.scss'

export function HomeNoticePopup({ result }: { result: PopNoticeResponse | null }) {
    const { t } = useTranslation()
    const [notice, setNotice] = useState<Notice | null>(null)
    const [show, setShow] = useState(false)
    const { submitting, execute } = useApiMutation()

    useEffect(() => {
        if (!result?.is_show || !result.notice || Array.isArray(result.notice)) {
            setNotice(null)
            setShow(false)
            return
        }
        setNotice(result.notice)
        setShow(true)
    }, [result])

    function dismiss() {
        if (!notice || submitting) return
        void execute((signal) => markNoticeRead(notice.id, signal), () => setShow(false))
    }

    return (
        <Popup show={show} title={t('公告')} closeOnOverlayClick={false} contentClassName="home-notice-popup">
            <h2 className="home-notice-popup__title size-32 bold-6 lh-44 mt-30">{notice?.title}</h2>
            <p className="home-notice-popup__date size-24 lh-34 mt-12">{notice?.updated_at}</p>
            <div className="home-notice-popup__content scroll-y size-28 lh-44 mt-24"><NoticeContent content={notice?.content ?? ''} /></div>
            <button type="button" className="home-notice-popup__dismiss mt-30" disabled={submitting} aria-busy={submitting} onClick={dismiss}>{t('知道了')}</button>
        </Popup>
    )
}
