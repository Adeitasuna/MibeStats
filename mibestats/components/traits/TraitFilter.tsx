'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { clsx } from 'clsx'
import type { TraitDistribution, TraitCount } from '@/types'

const FILTER_CATEGORIES: Array<{
  key:   string
  label: string
  field: keyof Pick<
    TraitDistribution,
    'archetypes' | 'ancestors' | 'elements' | 'drugs' |
    'hats' | 'glasses' | 'shirts' | 'backgrounds' | 'swagRanks'
  >
}> = [
  { key: 'archetype',  label: 'Archetype',   field: 'archetypes'  },
  { key: 'ancestor',   label: 'Ancestor',    field: 'ancestors'   },
  { key: 'element',    label: 'Element',     field: 'elements'    },
  { key: 'drug',       label: 'Drug',        field: 'drugs'       },
  { key: 'background', label: 'Background',  field: 'backgrounds' },
  { key: 'hat',        label: 'Hat',         field: 'hats'        },
  { key: 'shirt',      label: 'Shirt',       field: 'shirts'      },
  { key: 'glasses',    label: 'Glasses',     field: 'glasses'     },
  { key: 'swag_rank',  label: 'Swag Rank',   field: 'swagRanks'   },
]

interface Props {
  traits:         TraitDistribution
  currentFilters: Record<string, string>
}

export function TraitFilter({ traits, currentFilters }: Props) {
  const router   = useRouter()
  const pathname = usePathname()

  // Start with archetype open by default
  const [open, setOpen] = useState<Record<string, boolean>>({ archetype: true })

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(currentFilters)
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete('page') // reset to page 1
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, currentFilters],
  )

  const resetAll = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const hasFilters = FILTER_CATEGORIES.some((c) => currentFilters[c.key]) ||
                     currentFilters.is_grail !== undefined

  return (
    <div className="card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Filters
        </h2>
        {hasFilters && (
          <button
            onClick={resetAll}
            className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-1.5">
          {currentFilters.is_grail === 'true' && (
            <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/15 text-yellow-300 border border-yellow-500/20 rounded-full px-2 py-0.5">
              Grails only
              <button
                onClick={() => setFilter('is_grail', null)}
                className="hover:text-white ml-0.5"
                aria-label="Remove grail filter"
              >
                ×
              </button>
            </span>
          )}
          {FILTER_CATEGORIES.filter((c) => currentFilters[c.key]).map((c) => (
            <span
              key={c.key}
              className="inline-flex items-center gap-1 text-xs bg-white/10 text-white rounded-full px-2 py-0.5"
            >
              <span className="text-gray-400">{c.label}:</span>
              <span className="truncate max-w-[80px]">{currentFilters[c.key]}</span>
              <button
                onClick={() => setFilter(c.key, null)}
                className="text-gray-400 hover:text-white ml-0.5 shrink-0"
                aria-label={`Remove ${c.label} filter`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Grails toggle */}
      <div className="border-t border-[var(--border)] pt-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={currentFilters.is_grail === 'true'}
            onChange={(e) => setFilter('is_grail', e.target.checked ? 'true' : null)}
            className="rounded accent-yellow-400 w-3.5 h-3.5"
          />
          <span className="text-sm text-gray-300">Grails only</span>
          <span className="ml-auto text-xs text-gray-500">42</span>
        </label>
      </div>

      {/* Category dropdowns */}
      {FILTER_CATEGORIES.map((cat) => {
        const items  = traits[cat.field] as TraitCount[]
        const isOpen = open[cat.key] ?? false
        const active = currentFilters[cat.key]

        return (
          <div key={cat.key} className="border-t border-[var(--border)] pt-3">
            <button
              onClick={() => setOpen((s) => ({ ...s, [cat.key]: !isOpen }))}
              className="w-full flex items-center justify-between text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span className="font-medium">{cat.label}</span>
              <div className="flex items-center gap-2">
                {active && (
                  <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 rounded">
                    {active.length > 10 ? active.slice(0, 9) + '…' : active}
                  </span>
                )}
                <span className="text-gray-600 text-xs">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <ul className="mt-2 space-y-0.5 max-h-52 overflow-y-auto pr-1">
                {items.map((item) => (
                  <li key={item.value}>
                    <button
                      onClick={() =>
                        setFilter(cat.key, active === item.value ? null : item.value)
                      }
                      className={clsx(
                        'w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors',
                        active === item.value
                          ? 'bg-white/15 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5',
                      )}
                    >
                      <span className="truncate text-left mr-2">{item.value}</span>
                      <span className="text-gray-600 shrink-0 tabular-nums">{item.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
