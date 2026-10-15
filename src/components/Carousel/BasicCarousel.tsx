import { Children, type ReactNode } from 'react'
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'
import './BasicCarousel.scss'

export interface BasicCarouselProps {
    children: ReactNode
    direction?: 'horizontal' | 'vertical'
    className?: string
}

export function BasicCarousel({
    children,
    direction = 'horizontal',
    className,
}: BasicCarouselProps) {
    const slides = Children.toArray(children)
    const hasMultipleSlides = slides.length > 1
    const carouselClassName = [
        'carousel',
        direction === 'vertical' && 'carousel--vertical',
        className,
    ].filter(Boolean).join(' ')

    return (
        <Swiper
            className={carouselClassName}
            direction={direction}
            slidesPerView={1}
            modules={[Autoplay]}
            autoplay={hasMultipleSlides ? {
                delay: 3000,
                disableOnInteraction: false,
            } : false}
            loop={hasMultipleSlides}
            autoHeight={direction === 'horizontal'}
        >
            {slides.map((child, index) => (
                <SwiperSlide key={index}>
                    <div className="carousel__card">{child}</div>
                </SwiperSlide>
            ))}
        </Swiper>
    )
}
