import { useTranslation } from 'react-i18next'
import { Empty } from '@/components/Empty'
import './ApiState.scss'

export function ApiState({ loading, error, empty = false, onRetry }: {
    loading: boolean
    error: boolean
    empty?: boolean
    onRetry: () => Promise<void>
}) {
    const { t } = useTranslation()
    return (
        <div className="api-state tc size-26 lh-40" aria-busy={loading}>
            {loading && <p role="status" className="pt-20 pb-20">{t('加载中')}</p>}
            {error && <button type="button" className="api-state__retry mt-20 mb-20" onClick={() => void onRetry()}>{t('加载失败，点击重试')}</button>}
            {!loading && !error && empty && <Empty />}
        </div>
    )
}

export function ApiListFooter({ loading, error, hasMore, items, reload, loadMore, retry }: {
    loading: boolean
    error: boolean
    hasMore: boolean
    items: readonly unknown[]
    reload: () => Promise<void>
    loadMore: () => Promise<void>
    retry?: () => Promise<void>
}) {
    const { t } = useTranslation()
    return <>
        <ApiState loading={loading} error={error} empty={!items.length} onRetry={retry ?? reload} />
        {!loading && !error && hasMore && <button type="button" className="api-state__more mt-24" onClick={() => void loadMore()}>{t('加载更多')}</button>}
    </>
}
