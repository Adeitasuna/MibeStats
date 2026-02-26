import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { SalesCharts } from '@/components/sales/SalesCharts'
import { SalesTable } from '@/components/sales/SalesTable'
import type { Sale, SwagRank } from '@/types'
import type { SalePoint } from '@/components/sales/PriceChart'
import type { VolumeEntry } from '@/components/sales/VolumeChart'

export const metadata: Metadata = {
  title: 'Sales History',
  description: 'Mibera333 sales history — price chart, daily volume, and filterable sales table.',
}

export const dynamic = 'force-dynamic'   // Render at request time (requires DB)

async function getRecentSales(): Promise<{ sales: Sale[]; chartPoints: SalePoint[] }> {
  const rows = await prisma.sale.findMany({
    orderBy: { soldAt: 'desc' },
    take:    500,
    select: {
      id:            true,
      tokenId:       true,
      priceBera:     true,
      priceUsd:      true,
      soldAt:        true,
      buyerAddress:  true,
      sellerAddress: true,
      txHash:        true,
      marketplace:   true,
      token: {
        select: {
          tokenId:  true,
          imageUrl: true,
          swagRank: true,
          isGrail:  true,
        },
      },
    },
  })

  const sales: Sale[] = rows.map((r) => ({
    id:            String(r.id),
    tokenId:       r.tokenId,
    priceBera:     Number(r.priceBera),
    priceUsd:      r.priceUsd ? Number(r.priceUsd) : null,
    soldAt:        r.soldAt.toISOString(),
    buyerAddress:  r.buyerAddress,
    sellerAddress: r.sellerAddress,
    txHash:        r.txHash,
    marketplace:   r.marketplace,
    token:         r.token ? { ...r.token, swagRank: r.token.swagRank as SwagRank } : undefined,
  }))

  const chartPoints: SalePoint[] = sales.map((s) => ({
    soldAt:  s.soldAt,
    price:   s.priceBera,
    tokenId: s.tokenId,
    isGrail: s.token?.isGrail ?? false,
  }))

  return { sales, chartPoints }
}

async function getVolumeHistory(): Promise<VolumeEntry[]> {
  const rows = await prisma.$queryRaw<{ date: Date; volume: string }[]>`
    SELECT
      DATE(sold_at)           AS date,
      SUM(price_bera)::TEXT   AS volume
    FROM sales
    WHERE sold_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE(sold_at)
    ORDER BY date ASC
  `
  return rows.map((r) => ({
    date:   r.date.toISOString().slice(0, 10),
    volume: parseFloat(r.volume),
  }))
}

export default async function SalesPage() {
  const [{ sales, chartPoints }, volumeHistory, totalSales] = await Promise.all([
    getRecentSales(),
    getVolumeHistory(),
    prisma.sale.count(),
  ])

  // Initial table data: first 50 from the 500-sale fetch
  const initialSales = sales.slice(0, 50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales History</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {totalSales.toLocaleString()} total sales · price chart · daily volume · filterable table
        </p>
      </div>

      {/* Charts section */}
      <SalesCharts sales={chartPoints} volumeHistory={volumeHistory} />

      {/* Sales table */}
      <SalesTable initialSales={initialSales} initialTotal={totalSales} />
    </div>
  )
}
