import type { CSSProperties, ReactNode } from "react"

import { getAdCreative, type AdPlacement } from "@/lib/ads"

type AdSlotProps = {
  /** Named placement used to select a creative from NEXT_PUBLIC_FILMBASE_ADS. */
  placement?: AdPlacement
  /** Override the visible disclosure. Keep this explicit and honest. */
  label?: string
  /** Real third-party units may be supplied directly; empty children still collapse. */
  children?: ReactNode
  compact?: boolean
  className?: string
}

/**
 * A bounded, responsive ad placement. With no configured creative and no
 * children it renders nothing at all, including no margin or reserved height.
 *
 * Usage:
 *   <AdSlot placement="catalogue-inline" />
 *   <AdSlot placement="detail-inline">{realNetworkUnit}</AdSlot>
 */
export function AdSlot({
  placement,
  label = "Advertisement",
  children,
  compact = false,
  className = "",
}: AdSlotProps) {
  const creative = placement ? getAdCreative(placement) : null
  const content = children ?? (creative ? <ConfiguredCreative creative={creative} /> : null)

  if (!content) return null

  return (
    <aside
      className={`mx-auto w-full overflow-hidden border-y border-border ${compact ? "max-w-2xl py-1.5" : "max-w-5xl py-2"} ${className}`}
      aria-label={label}
      data-ad-placement={placement}
    >
      <span className="mb-1 block text-center text-[9px] font-medium uppercase tracking-[.16em] text-muted-foreground">
        {creative?.sponsor && label === "Sponsored" ? `Sponsored by ${creative.sponsor}` : label}
      </span>
      <div className="flex min-h-0 w-full items-center justify-center overflow-hidden">{content}</div>
    </aside>
  )
}

function ConfiguredCreative({ creative }: { creative: NonNullable<ReturnType<typeof getAdCreative>> }) {
  const ratio = `${creative.width} / ${creative.height}`
  const style = {
    aspectRatio: ratio,
    maxWidth: `${creative.width}px`,
  } satisfies CSSProperties

  return (
    <a
      href={creative.targetUrl}
      target="_blank"
      rel="noopener noreferrer sponsored nofollow"
      className="block w-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={style}
      aria-label={`${creative.alt} (sponsored link, opens in a new tab)`}
    >
      {/* A configured unit reserves only its declared aspect ratio, limiting layout shift. */}
      <img
        src={creative.imageUrl}
        alt={creative.alt}
        width={creative.width}
        height={creative.height}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain"
      />
    </a>
  )
}
