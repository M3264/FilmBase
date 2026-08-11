import type { ReactNode } from "react"

import { AdSlot } from "@/components/ad-slot"

/**
 * Footer placement configured by the `footer` key in
 * NEXT_PUBLIC_FILMBASE_ADS. Pass children only for a real, initialized ad unit.
 * If neither exists, the component collapses completely.
 */
export function FooterAd({ children }: { children?: ReactNode }) {
  return <AdSlot placement="footer" className="mt-8" label="Advertisement">{children}</AdSlot>
}
