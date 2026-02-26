'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { isAddress } from 'viem'

export function WalletSearchBar() {
  const [value, setValue]      = useState('')
  const [error, setError]      = useState<string | null>(null)
  const [, startTransition]    = useTransition()
  const router                 = useRouter()

  function validate(addr: string): boolean {
    if (!addr.trim()) {
      setError('Enter a wallet address')
      return false
    }
    if (!isAddress(addr, { strict: true })) {
      setError('Invalid address — must be EIP-55 checksummed (e.g. 0xAbCd...)')
      return false
    }
    setError(null)
    return true
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate(value)) return
    startTransition(() => {
      router.push(`/portfolio/${value}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mibe-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError(null)
            }}
            placeholder="0x... (EIP-55 checksummed address)"
            spellCheck={false}
            autoComplete="off"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-mibe-bg border border-mibe-border text-sm text-white placeholder:text-mibe-muted focus:outline-none focus:border-mibe-gold font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-mibe-gold hover:bg-yellow-300 text-black text-sm font-semibold transition-colors shrink-0"
        >
          Search
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-mibe-red">{error}</p>
      )}
    </form>
  )
}
