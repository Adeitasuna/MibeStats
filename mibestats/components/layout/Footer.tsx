import { CONTRACT_ADDRESS } from '@/types'

export function Footer() {
  const berascan = `https://beratrail.io/address/${CONTRACT_ADDRESS}`

  return (
    <footer className="border-t border-[var(--border)] mt-12 py-6 text-sm text-gray-500">
      <div className="container mx-auto px-4 max-w-7xl flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-gray-400 font-medium">MibeStats</span>
          <span>Community analytics for Mibera333 on Berachain</span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <a href={berascan} target="_blank" rel="noreferrer" className="hover:text-gray-300 transition-colors">
            Contract ↗
          </a>
          <a href="https://github.com/0xHoneyJar/mibera-codex" target="_blank" rel="noreferrer" className="hover:text-gray-300 transition-colors">
            Data: mibera-codex ↗
          </a>
        </div>
      </div>
    </footer>
  )
}
