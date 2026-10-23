import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Empty } from '@/components/Empty'
import { noticePlainText } from '@/components/NoticeContent/plainText.ts'
import { InfiniteScroll } from '@/components/InfiniteScroll'
import { usePageRefresh } from '@/components/PagePullRefresh'
import { SecondaryHeader } from '@/components/SecondaryHeader'
import { ROUTE_PATH } from '@/router'

import { useNoticeList } from './useNoticeList'
import './NoticeListPage.scss'

export function NoticeListPage() {
    const { t } = useTranslation()
    const { notices, loading, hasMore, error, reload, loadMore, retry } = useNoticeList()
    usePageRefresh(reload)

    return (
        <section className="notice-list-page secondary-page-background min-vh-100" data-page="notice-list" aria-label={t('公告列表')}>
            <SecondaryHeader title="公告列表" />
            <div className="container pb-40">
                <InfiniteScroll loading={loading} hasMore={hasMore} disabled={error} onLoadMore={loadMore} aria-busy={loading}>
                    <ul className="grid grid-1 row-gap-20">
                        {notices.map((notice) => (
                            <li key={notice.id}>
                                <Link to={ROUTE_PATH.noticeDetail.replace(':id', String(notice.id))} className="notice-list-page__card app-card grid grid-1 row-gap-14">
                                    <h2 className="notice-list-page__title size-30 lh-44 bold-6">{notice.title}</h2>
                                    <time className="notice-list-page__muted size-24 lh-34" dateTime={notice.updated_at.replace(' ', 'T')}>{notice.updated_at}</time>
                                    <p className="notice-list-page__excerpt word-ellipsis-2 size-26 lh-40">{noticePlainText(notice.content)}</p>
                                    <span className="app-color size-24 lh-34">{t('阅读全文')}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {!loading && !error && notices.length === 0 && <Empty />}
                    {loading && <p role="status" className="notice-list-page__muted size-26 lh-40 tc pt-30 pb-20">{t('加载中')}</p>}
                    {error && (
                        <div className="tc pt-30 pb-20">
                            <p role="alert" className="notice-list-page__muted size-26 lh-40 mb-20">{t('加载失败，请重试')}</p>
                            <button type="button" className="notice-list-page__retry" onClick={() => void retry()}>
                                {t('重新加载')}
                            </button>
                        </div>
                    )}
                    {!loading && !error && hasMore && (
                        <button type="button" className="notice-list-page__load-more mt-30" onClick={() => void loadMore()}>
                            {t('加载更多')}
                        </button>
                    )}
                    {!loading && !error && !hasMore && notices.length > 0 && (
                        <p className="notice-list-page__muted size-24 lh-36 tc pt-30 pb-20">{t('没有更多了')}</p>
                    )}
                </InfiniteScroll>
            </div>
        </section>
    )
}
