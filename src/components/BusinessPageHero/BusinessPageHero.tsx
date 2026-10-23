import heroOverlayUrl from '@/assets/common/hero-overlay.svg'

import './BusinessPageHero.scss'

interface BusinessPageHeroProps {
    imageUrl: string
    title: string
    subtitle: string
    overlayUrl?: string | null
}

export function BusinessPageHero({ imageUrl, title, subtitle, overlayUrl = heroOverlayUrl }: BusinessPageHeroProps) {
    return (
        <div className="business-page-hero" data-reveal="scale">
            <img src={imageUrl} className="business-page-hero__image" alt="" />
            {overlayUrl ? <img src={overlayUrl} className="business-page-hero__overlay" alt="" /> : null}
            <div className="business-page-hero__copy">
                <h1 className="business-page-hero__title size-52 bold-7 lh-72">{title}</h1>
                <p className="business-page-hero__subtitle size-24 lh-34 white mt-6">{subtitle}</p>
            </div>
        </div>
    )
}
