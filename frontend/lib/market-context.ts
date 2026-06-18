import { Pool } from "pg"

// Read-only grounding: pull a compact snapshot of the Entrestate market data so
// Dubay cites real Dubai figures instead of general knowledge. Degrades to "" on
// any error (no DATABASE_URL, unreachable, schema drift) — never breaks the chat.

let pool: Pool | null = null
function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null
  if (!pool) {
    const cs = process.env.DATABASE_URL
    const local = cs.includes("localhost") || cs.includes("127.0.0.1")
    pool = new Pool({
      connectionString: cs,
      ssl: local ? false : { rejectUnauthorized: false },
      max: 3,
    })
  }
  return pool
}

function aed(value: unknown): string | null {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return `AED ${Math.round(n).toLocaleString("en-US")}`
}
function num(value: unknown, digits = 1): string | null {
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(digits) : null
}

export async function buildMarketContext(question: string): Promise<string> {
  const p = getPool()
  if (!p) return ""
  const parts: string[] = []

  try {
    const ov = await p.query("select * from get_market_overview()")
    const o = ov.rows[0]
    if (o) {
      parts.push(
        `Market overview: ${o.total} projects tracked, average investment score ${o.avg_score}/100. ` +
          `Safety bands — Institutional Safe ${o.inst_safe}, Capital Safe ${o.cap_safe}, ` +
          `Opportunistic ${o.opportunistic}, Speculative ${o.speculative}.`,
      )
    }
  } catch {
    /* skip */
  }

  try {
    const areas = await p.query(
      `select c.area,
              c.yield_median,
              c.price_median_aed,
              c.growth_index,
              b.avg_price_per_sqft,
              b.yoy_growth_pct,
              b.transaction_volume_30d
         from entrestate_area_cards c
         left join dld_area_benchmarks b on lower(b.area_name_clean) = lower(c.area)
        order by c.growth_index desc nulls last
        limit 12`,
    )
    if (areas.rows.length) {
      const lines = areas.rows.map((a) => {
        const bits: string[] = []
        const price = aed(a.price_median_aed)
        if (price) bits.push(`median ${price}`)
        const yld = num(a.yield_median)
        if (yld) bits.push(`yield ${yld}`)
        const psf = num(a.avg_price_per_sqft, 0)
        if (psf) bits.push(`${psf} AED/sqft`)
        const yoy = num(a.yoy_growth_pct)
        if (yoy) bits.push(`YoY ${yoy}%`)
        return `- ${a.area}${bits.length ? " — " + bits.join(" · ") : ""}`
      })
      parts.push(`Area benchmarks (top by growth):\n${lines.join("\n")}`)
    }
  } catch {
    /* skip */
  }

  if (!parts.length) return ""
  return `Live Entrestate market data — treat these as the canonical figures and cite them (all AED):\n\n${parts.join("\n\n")}`
}

export interface MarketRow {
  area: string
  price: number | null
  yield: number | null
  psf: number | null
  yoy: number | null
  volume: number | null
}

export interface MarketBoard {
  rows: MarketRow[]
  total: number | null
  live: boolean
  updatedAt: string
}

// Labeled fallback so the board renders before DATABASE_URL is wired.
const SAMPLE: MarketRow[] = [
  { area: "Arjan", price: 850000, yield: 8.1, psf: 1050, yoy: 13.0, volume: 520 },
  { area: "Jumeirah Village Circle", price: 1150000, yield: 7.8, psf: 1150, yoy: 14.2, volume: 1240 },
  { area: "Dubai Marina", price: 1850000, yield: 6.2, psf: 1650, yoy: 9.1, volume: 980 },
  { area: "Business Bay", price: 1650000, yield: 6.0, psf: 1750, yoy: 8.4, volume: 870 },
  { area: "JBR", price: 2100000, yield: 5.8, psf: 2000, yoy: 7.2, volume: 410 },
  { area: "Dubai Hills Estate", price: 2600000, yield: 5.6, psf: 1900, yoy: 11.0, volume: 540 },
  { area: "Downtown Dubai", price: 2900000, yield: 5.1, psf: 2400, yoy: 6.3, volume: 610 },
  { area: "Palm Jumeirah", price: 6200000, yield: 4.3, psf: 3200, yoy: 12.5, volume: 320 },
]

/** A ranked market board from live Entrestate data; sample fallback on any error. */
export async function getMarketBoard(): Promise<MarketBoard> {
  const updatedAt = new Date().toISOString()
  const p = getPool()
  if (!p) return { rows: SAMPLE, total: null, live: false, updatedAt }
  try {
    const res = await p.query(
      `select c.area, c.yield_median, c.price_median_aed,
              b.avg_price_per_sqft, b.yoy_growth_pct, b.transaction_volume_30d
         from entrestate_area_cards c
         left join dld_area_benchmarks b on lower(b.area_name_clean) = lower(c.area)
        order by c.yield_median desc nulls last
        limit 10`,
    )
    if (!res.rows.length) return { rows: SAMPLE, total: null, live: false, updatedAt }
    let total: number | null = null
    try {
      const ov = await p.query("select total from get_market_overview()")
      total = ov.rows[0]?.total != null ? Number(ov.rows[0].total) : null
    } catch {
      /* skip */
    }
    const toNum = (v: unknown) => (v != null && Number.isFinite(Number(v)) ? Number(v) : null)
    const rows: MarketRow[] = res.rows.map((a) => ({
      area: String(a.area),
      price: toNum(a.price_median_aed),
      yield: toNum(a.yield_median),
      psf: toNum(a.avg_price_per_sqft),
      yoy: toNum(a.yoy_growth_pct),
      volume: toNum(a.transaction_volume_30d),
    }))
    return { rows, total, live: true, updatedAt }
  } catch {
    return { rows: SAMPLE, total: null, live: false, updatedAt }
  }
}
