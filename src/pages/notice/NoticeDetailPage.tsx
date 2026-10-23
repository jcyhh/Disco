import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { Empty } from '@/components/Empty'
import { NoticeContent } from '@/components/NoticeContent/NoticeContent.tsx'
import { usePageRefresh } from '@/components/PagePullRefresh'
import { SecondaryHeader } from '@/components/SecondaryHeader'
import { ROUTE_PATH } from '@/router'

import { useNoticeDetail } from './useNoticeDetail'
import { parseNoticeId } from './utils'
import './NoticeDetailPage.scss'

export function NoticeDetailPage() {
    const { t } = useTranslation()
    const { id } = useParams<{ id: string }>()
    const noticeId = parseNoticeId(id)
    const { notice, loading, error, reload } = useNoticeDetail(noticeId)
    usePageRefresh(reload)

    return (
        <section className="notice-detail-page secondary-page-background min-vh-100" data-page="notice-detail" aria-label={t('公告详情')}>
            <SecondaryHeader title="公告详情" />
            <div className="container pb-40" aria-busy={loading}>
                {loading ? (
                    <p role="status" className="notice-detail-page__muted size-26 lh-40 tc pt-30 pb-20">{t('加载中')}</p>
                ) : error ? (
                    <div className="tc pt-30 pb-20">
                        <p role="alert" className="notice-detail-page__muted size-26 lh-40 mb-20">{t('加载失败，请重试')}</p>
                        <button type="button" className="notice-detail-page__retry" onClick={() => void reload()}>{t('重新加载')}</button>
                    </div>
                ) : notice ? (
                    <article className="notice-detail-page__card app-card">
                        <h1 className="notice-detail-page__title size-36 lh-54 bold-6">{notice.title}</h1>
                        <time className="notice-detail-page__date notice-detail-page__muted size-24 lh-36 mt-20" dateTime={notice.updated_at.replace(' ', 'T')}>{notice.updated_at}</time>
                        <div className="notice-detail-page__content size-28 lh-46 pt-30 mt-30"><NoticeContent content={notice.content} /></div>
                    </article>
                ) : (
                    <div className="tc">
                        <Empty />
                        <p className="notice-detail-page__muted size-26 lh-40 mb-30">{t('公告不存在或已删除')}</p>
                        <Link to={ROUTE_PATH.notice} className="notice-detail-page__back">{t('返回公告列表')}</Link>
                    </div>
                )}
            </div>
        </section>
    )
}
