'use client'

export function PacManLoader() {
  return (
    <div className="flex justify-center items-center" style={{ minHeight: '200px' }}>
      <div className="pacman-loader">
        <div className="pacman" />
        <div className="pacman-dots">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
