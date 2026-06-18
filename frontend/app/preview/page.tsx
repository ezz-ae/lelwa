import { getMarketBoard } from "@/lib/market-context"
import { MarketTerminal } from "./terminal"

// Regenerate from live Entrestate data every hour.
export const revalidate = 3600

export default async function Preview() {
  const board = await getMarketBoard()
  return <MarketTerminal board={board} />
}
