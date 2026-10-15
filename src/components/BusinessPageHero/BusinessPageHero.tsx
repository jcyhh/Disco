import heroOverlayUrl from '@/assets/common/hero-overlay.svg'

import './BusinessPageHero.scss'

interface BusinessPageHeroProps {
    imageUrl: string
    title: string
    subtitle: string
}

export function BusinessPageHero({ imageUrl, title, subtitle }: BusinessPageHeroProps) {
    return (
        <div className="business-page-hero">
            <img src={imageUrl} className="business-page-hero__image" alt="" />
            <img src={heroOverlayUrl} className="business-page-hero__overlay" alt="" />
            <div className="business-page-hero__copy">
                <h1 className="business-page-hero__title size-52 bold-7 lh-72">{title}</h1>
                <p className="business-page-hero__subtitle size-24 lh-34 white mt-6">{subtitle}</p>
            </div>
        </div>
    )
}
