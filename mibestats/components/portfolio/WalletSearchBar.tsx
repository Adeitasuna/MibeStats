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
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold transition-colors shrink-0"
        >
          Search
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </form>
  )
}
