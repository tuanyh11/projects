'use client'

import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

import { DefaultDocumentIDType } from 'payload'

type Props = {
  gallery: NonNullable<Product['gallery']>
}

export const Gallery: React.FC<Props> = ({ gallery }) => {
  const searchParams = useSearchParams()
  const [activeImage, setActiveImage] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  // Variant-based gallery sync
  useEffect(() => {
    const values = Array.from(searchParams.values())
    if (values.length > 0) {
      const index = gallery.findIndex((item) => {
        if (!item.variantOption) return false
        let variantID: DefaultDocumentIDType
        if (typeof item.variantOption === 'object') {
          variantID = item.variantOption.id
        } else variantID = item.variantOption
        return Boolean(values.find((value) => value === String(variantID)))
      })
      if (index !== -1) {
        setActiveImage(index)
      }
    }
  }, [searchParams, gallery])

  const openLightbox = useCallback((index: number) => {
    setActiveImage(index)
    setLightbox(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightbox(false)
  }, [])

  const goNext = useCallback(() => {
    setActiveImage((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
  }, [gallery.length])

  const goPrev = useCallback(() => {
    setActiveImage((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))
  }, [gallery.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox) return
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightbox, goNext, goPrev, closeLightbox])

  const count = gallery.length

  // ═══ Grid layouts based on image count ═══
  const renderGrid = () => {
    if (count === 1) {
      return renderSingleImage()
    }
    if (count === 2) {
      return renderTwoImages()
    }
    if (count === 3) {
      return renderThreeImages()
    }
    if (count === 4) {
      return renderFourImages()
    }
    return renderFivePlusImages()
  }

  // 1 image — full area
  const renderSingleImage = () => (
    <div className="grid grid-cols-1 gap-2" style={{ height: 'clamp(400px, 50vh, 600px)' }}>
      <GridCell item={gallery[0]} index={0} />
    </div>
  )

  // 2 images — 60/40 split
  const renderTwoImages = () => (
    <div className="grid grid-cols-5 gap-2" style={{ height: 'clamp(400px, 50vh, 600px)' }}>
      <div className="col-span-3">
        <GridCell item={gallery[0]} index={0} />
      </div>
      <div className="col-span-2">
        <GridCell item={gallery[1]} index={1} />
      </div>
    </div>
  )

  // 3 images — 1 large left, 2 stacked right
  const renderThreeImages = () => (
    <div className="grid grid-cols-5 grid-rows-2 gap-2" style={{ height: 'clamp(400px, 50vh, 600px)' }}>
      <div className="col-span-3 row-span-2">
        <GridCell item={gallery[0]} index={0} />
      </div>
      <div className="col-span-2">
        <GridCell item={gallery[1]} index={1} />
      </div>
      <div className="col-span-2">
        <GridCell item={gallery[2]} index={2} />
      </div>
    </div>
  )

  // 4 images — 1 large left, 2 right, 1 bottom spanning
  const renderFourImages = () => (
    <div className="grid grid-cols-5 grid-rows-3 gap-2" style={{ height: 'clamp(440px, 55vh, 650px)' }}>
      <div className="col-span-3 row-span-2">
        <GridCell item={gallery[0]} index={0} />
      </div>
      <div className="col-span-2">
        <GridCell item={gallery[1]} index={1} />
      </div>
      <div className="col-span-2">
        <GridCell item={gallery[2]} index={2} />
      </div>
      <div className="col-span-5">
        <GridCell item={gallery[3]} index={3} />
      </div>
    </div>
  )

  // 5+ images — mosaic: 1 large top-left, 2 right stacked, 2-3 bottom row
  const renderFivePlusImages = () => {
    const items = gallery.slice(0, 5)
    const remaining = gallery.length - 5

    return (
      <div className="grid grid-cols-6 grid-rows-2 gap-2" style={{ height: 'clamp(440px, 55vh, 650px)' }}>
        {/* Main large image — top left */}
        <div className="col-span-4 row-span-2 relative">
          <GridCell item={items[0]} index={0} />
        </div>
        {/* Right column — 2 stacked */}
        <div className="col-span-2">
          <GridCell item={items[1]} index={1} />
        </div>
        <div className="col-span-2 relative">
          <GridCell item={items[2]} index={2} />
          {/* Show remaining count on last visible image */}
          {remaining > 0 && (
            <button
              onClick={() => openLightbox(2)}
              className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer transition-opacity duration-300"
              style={{ background: 'rgba(30,28,23,0.4)', backdropFilter: 'blur(2px)', borderRadius: '2px' }}
            >
              <span className="text-white text-sm font-light tracking-widest">+{remaining}</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // Reusable grid cell
  const GridCell = ({ item, index }: { item: NonNullable<Product['gallery']>[0]; index: number }) => {
    if (typeof item.image !== 'object') return null
    return (
      <button
        onClick={() => openLightbox(index)}
        className="relative w-full h-full overflow-hidden group/cell cursor-pointer outline-none"
        style={{ borderRadius: '2px' }}
      >
        <Media
          resource={item.image}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/cell:scale-[1.04]"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover/cell:bg-black/5 transition-colors duration-500" />

        {/* Corner marks on main image */}
        {index === 0 && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-3 left-3">
              <div className="w-5 h-px" style={{ background: 'rgba(255,255,255,0.35)' }} />
              <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.35)' }} />
            </div>
            <div className="absolute bottom-3 right-3">
              <div className="w-5 h-px ml-auto" style={{ background: 'rgba(255,255,255,0.25)' }} />
              <div className="w-px h-5 ml-auto" style={{ background: 'rgba(255,255,255,0.25)' }} />
            </div>
          </div>
        )}

        {/* Zoom icon on hover */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-400">
          <div
            className="w-7 h-7 flex items-center justify-center"
            style={{ borderRadius: '2px', background: 'rgba(30,28,23,0.3)', backdropFilter: 'blur(8px)' }}
          >
            <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
            </svg>
          </div>
        </div>
      </button>
    )
  }

  return (
    <>
      {/* ═══ Image Grid ═══ */}
      {renderGrid()}

      {/* ═══ Lightbox ═══ */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(20,18,14,0.92)', backdropFilter: 'blur(20px)' }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center
              text-white/50 hover:text-white/90 border border-white/10 hover:border-white/30
              transition-all duration-400 cursor-pointer z-50"
            style={{ borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation arrows */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center
                  text-white/40 hover:text-white/90 border border-white/10 hover:border-white/30
                  transition-all duration-400 cursor-pointer z-50"
                style={{ borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext() }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center
                  text-white/40 hover:text-white/90 border border-white/10 hover:border-white/30
                  transition-all duration-400 cursor-pointer z-50"
                style={{ borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          {/* Main lightbox image */}
          <div
            className="max-w-[85vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Media
              resource={gallery[activeImage].image}
              className="w-full h-full"
              imgClassName="max-w-[85vw] max-h-[85vh] object-contain"
            />
          </div>

          {/* Image counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
            {gallery.map((_, i) => (
              <button
                key={`lb-dot-${i}`}
                onClick={(e) => { e.stopPropagation(); setActiveImage(i) }}
                className={`transition-all duration-500 cursor-pointer ${i === activeImage
                    ? 'w-6 h-[2px] bg-white/80'
                    : 'w-2 h-[2px] bg-white/25 hover:bg-white/50'
                  }`}
                style={{ borderRadius: '1px' }}
              />
            ))}
            <span className="text-white/30 text-[10px] tracking-widest font-light ml-2">
              {activeImage + 1} / {gallery.length}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
