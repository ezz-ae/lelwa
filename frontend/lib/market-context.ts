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
