'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

export function ScrollAnimations() {
    const initialized = useRef(false)

    useEffect(() => {
        if (initialized.current) return
        initialized.current = true

        // Small delay to ensure DOM is painted
        const timer = setTimeout(() => {
            const ctx = gsap.context(() => {

                // ═══ HERO parallax — gentle ═══
                gsap.to('[data-hero-bg]', {
                    yPercent: 20,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '[data-hero]',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    },
                })

                // Hero text — gentle fade
                gsap.to('[data-hero-content]', {
                    y: -40,
                    opacity: 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '[data-hero]',
                        start: '60% top',
                        end: 'bottom top',
                        scrub: true,
                    },
                })

                // ═══ SECTION HEADERS — zen reveal (gentle, no scale) ═══
                gsap.utils.toArray<HTMLElement>('[data-animate="section-header"]').forEach((el) => {
                    gsap.fromTo(el,
                        { y: 30, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1.4,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: el,
                                start: 'top 88%',
                                toggleActions: 'play none none none',
                            },
                        }
                    )
                })

                // ═══ CARDS — gentle stagger (no rotation, less movement) ═══
                gsap.utils.toArray<HTMLElement>('[data-animate="stagger-grid"]').forEach((grid) => {
                    const cards = Array.from(grid.children)
                    if (cards.length === 0) return

                    gsap.fromTo(cards,
                        { y: 40, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            stagger: 0.08,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: grid,
                                start: 'top 88%',
                                toggleActions: 'play none none none',
                            },
                        }
                    )
                })

                // ═══ ABOUT image grid — gentle scale ═══
                const imageGrid = document.querySelector('[data-animate="image-grid"]')
                if (imageGrid) {
                    const items = Array.from(imageGrid.children)
                    gsap.fromTo(items,
                        { scale: 0.95, opacity: 0, y: 20 },
                        {
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            duration: 1.2,
                            stagger: 0.12,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: imageGrid,
                                start: 'top 85%',
                                toggleActions: 'play none none none',
                            },
                        }
                    )
                }

                // ═══ FLOATING BADGES — gentle pop ═══
                gsap.utils.toArray<HTMLElement>('[data-animate="float-badge"]').forEach((el) => {
                    gsap.fromTo(el,
                        { scale: 0.8, opacity: 0 },
                        {
                            scale: 1,
                            opacity: 1,
                            duration: 1,
                            ease: 'power3.out',
                            delay: 0.3,
                            scrollTrigger: {
                                trigger: el,
                                start: 'top 95%',
                                toggleActions: 'play none none none',
                            },
                        }
                    )
                })

                // ═══ SLIDE LEFT — gentle ═══
                gsap.utils.toArray<HTMLElement>('[data-animate="slide-left"]').forEach((el) => {
                    gsap.fromTo(el,
                        { x: -40, opacity: 0 },
                        {
                            x: 0,
                            opacity: 1,
                            duration: 1.4,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: el,
                                start: 'top 85%',
                                toggleActions: 'play none none none',
                            },
                        }
                    )
                })

                // ═══ SLIDE RIGHT — gentle ═══
                gsap.utils.toArray<HTMLElement>('[data-animate="slide-right"]').forEach((el) => {
                    gsap.fromTo(el,
                        { x: 40, opacity: 0 },
                        {
                            x: 0,
                            opacity: 1,
                            duration: 1.4,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: el,
                                start: 'top 85%',
                                toggleActions: 'play none none none',
                            },
                        }
                    )
                })

                // ═══ TIMELINE items ═══
                gsap.utils.toArray<HTMLElement>('[data-animate="timeline-item"]').forEach((el, i) => {
                    gsap.fromTo(el,
                        { x: i % 2 === 0 ? -15 : 15, opacity: 0 },
                        {
                            x: 0,
                            opacity: 1,
                            duration: 0.8,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: el,
                                start: 'top 90%',
                                toggleActions: 'play none none none',
                            },
                        }
                    )
                })

                // ═══ FADE UP — gentle ═══
                gsap.utils.toArray<HTMLElement>('[data-animate="fade-up"]').forEach((el) => {
                    gsap.fromTo(el,
                        { y: 25, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: el,
                                start: 'top 90%',
                                toggleActions: 'play none none none',
                            },
                        }
                    )
                })

            })

            return () => ctx.revert()
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    return null
}
