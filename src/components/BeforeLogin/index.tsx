import React from 'react'

export const BeforeLogin: React.FC = () => {
  return (
    <div style={{
      textAlign: 'center',
      marginBottom: '24px',
    }}>
      <div style={{
        fontSize: '32px',
        marginBottom: '12px',
      }}>
        🍃
      </div>
      <h2 style={{
        margin: '0 0 4px',
        fontSize: '18px',
        fontWeight: 600,
        color: 'var(--theme-elevation-900)',
        letterSpacing: '-0.01em',
      }}>
        Hồng Thái Admin
      </h2>
      <p style={{
        margin: 0,
        fontSize: '13px',
        color: 'var(--theme-elevation-450)',
      }}>
        Đăng nhập để quản trị hệ thống
      </p>
    </div>
  )
}
