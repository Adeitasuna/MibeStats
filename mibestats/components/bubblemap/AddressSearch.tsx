'use client'

interface AddressSearchProps {
  searchAddr: string
  setSearchAddr: (value: string) => void
  focusedAddr: string | null
  onSearch: () => void
  onClear: () => void
}

export function AddressSearch({ searchAddr, setSearchAddr, focusedAddr, onSearch, onClear }: AddressSearchProps) {
  return (
    <div className="col-span-3 flex flex-col gap-1">
      <span className="card-title-upper">Search Address</span>
      <div className="flex gap-1.5">
        <input
          type="text"
          value={searchAddr}
          onChange={(e) => setSearchAddr(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder="0x..."
          className="bg-mibe-bg border border-mibe-border rounded px-2.5 py-1 text-xs text-white flex-1 focus:border-mibe-gold focus:outline-none"
        />
        <button onClick={onSearch} className="px-2.5 py-1 rounded text-xs font-semibold bg-mibe-gold/15 text-mibe-gold hover:bg-mibe-gold/25 transition-colors">
          Go
        </button>
        {focusedAddr && (
          <button onClick={onClear} className="px-2.5 py-1 rounded text-xs font-semibold bg-mibe-red/15 text-mibe-red hover:bg-mibe-red/25 transition-colors">
            Clear
          </button>
        )}
      </div>
      {focusedAddr && (
        <span className="text-[0.625rem] text-mibe-cyan">
          Focused: {focusedAddr.slice(0, 8)}...{focusedAddr.slice(-4)}
        </span>
      )}
      {searchAddr && !focusedAddr && searchAddr.length > 2 && (
        <span className="text-[0.625rem] text-mibe-red">Address not found</span>
      )}
    </div>
  )
}
