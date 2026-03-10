'use client'

import React, { useState } from 'react'

import type { Theme } from '../types'

import { useTheme } from '..'
import { themeLocalStorageKey } from '../shared'

export const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme()
  const [value, setValue] = useState('')

  const onThemeChange = (themeToSet: Theme & 'auto') => {
    if (themeToSet === 'auto') {
      setTheme(null)
      setValue('auto')
    } else {
      setTheme(themeToSet)
      setValue(themeToSet)
    }
  }

  React.useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    setValue(preference ?? 'auto')
  }, [])

  const options: { value: string; label: string; kanji: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Sáng',
      kanji: '陽',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: 'Tối',
      kanji: '陰',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
    {
      value: 'auto',
      label: 'Tự động',
      kanji: '和',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" opacity="0.15" />
          <path d="M12 2v20" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex items-center gap-1">
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onThemeChange(opt.value as Theme & 'auto')}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 transition-all duration-500 group"
            style={{
              borderRadius: '2px',
              border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
              background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
            }}
            title={opt.label}
          >
            <span
              className="zen-kanji transition-opacity duration-400"
              style={{
                fontSize: '9px',
                opacity: isActive ? 0.6 : 0.2,
              }}
            >
              {opt.kanji}
            </span>
            {opt.icon}
            <span
              className="text-[9px] tracking-[0.15em] uppercase font-light transition-opacity duration-400 hidden sm:inline"
              style={{ opacity: isActive ? 0.9 : 0.5 }}
            >
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
