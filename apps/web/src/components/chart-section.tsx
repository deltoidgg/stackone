import { useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "@workspace/ui/lib/utils"

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

export interface ChartBarData {
  timeStart: string
  timeEnd: string
  success: number
  error: number
}

export interface ChartXLabel {
  barIndex: number
  label: string
}

interface ChartSectionProps {
  bars: ChartBarData[]
  xLabels: ChartXLabel[]
  selectedBarIndex: number | null
  onBarClick: (index: number) => void
}

export function ChartSection({
  bars,
  xLabels,
  selectedBarIndex,
  onBarClick,
}: ChartSectionProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{
    x: number
    y: number
  } | null>(null)

  const yMax =
    Math.max(...bars.map((b) => b.success + b.error), 100) * 1.2
  const gridLines = computeGridLines(yMax)

  const totalSuccess = bars.reduce((s, b) => s + b.success, 0)
  const totalError = bars.reduce((s, b) => s + b.error, 0)
  const total = totalSuccess + totalError

  return (
    <div className="rounded-xl border border-border bg-[#f8f8f8]">
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-sm font-semibold text-foreground">
          API Requests
        </span>
        <div className="flex items-center gap-5">
          <StatItem
            dotColor="bg-muted-foreground/40"
            label="Total"
            value={fmt(total)}
            trend="— 0%"
            trendColor="text-muted-foreground"
          />
          <StatItem
            dotColor="bg-success"
            label="Success"
            value={fmt(totalSuccess)}
            trend="↑ 2%"
            trendColor="text-success-foreground"
          />
          <StatItem
            dotColor="bg-[#ef3737]/70"
            label="Error"
            value={fmt(totalError)}
            trend="↓ 2%"
            trendColor="text-[#ef3737]"
          />
        </div>
      </div>

      <div className="mx-3 mb-3 rounded-lg bg-white">
        <div className="flex">
          <div className="flex w-10 shrink-0 flex-col-reverse justify-between py-4 pr-1.5 text-right text-[10px] text-muted-foreground">
            {gridLines.map((v) => (
              <span key={v}>{v >= 1000 ? `${v / 1000}k` : v}</span>
            ))}
          </div>

          <div className="relative min-w-0 flex-1 py-4 pr-4">
            {gridLines.map((v) => (
              <div
                key={v}
                className="pointer-events-none absolute left-0 right-4 border-t border-dashed border-border/60"
                style={{ bottom: `${(v / yMax) * 100}%` }}
              />
            ))}

            {hoveredBar !== null &&
              tooltipPos &&
              createPortal(
                <div
                  className="pointer-events-none fixed z-[9999]"
                  style={{
                    left: `clamp(8px, ${tooltipPos.x - 100}px, calc(100vw - 208px))`,
                    top: tooltipPos.y,
                    transform: "translateY(-100%)",
                    marginTop: "-6px",
                  }}
                >
                  <BarTooltip
                    bar={bars[hoveredBar]}
                    isSelected={selectedBarIndex === hoveredBar}
                  />
                </div>,
                document.body,
              )}

            <div className="relative flex h-[160px] items-end gap-px">
              {bars.map((bar, i) => {
                const ePct = (bar.error / yMax) * 100
                const sPct = (bar.success / yMax) * 100
                const isHovered = hoveredBar === i
                const isSelected = selectedBarIndex === i
                const isDimmed =
                  selectedBarIndex !== null && !isSelected && !isHovered

                return (
                  <div
                    key={i}
                    role="button"
                    aria-label={`${bar.timeStart} – ${bar.success + bar.error} requests`}
                    tabIndex={0}
                    className={cn(
                      "flex min-w-0 flex-1 cursor-pointer flex-col justify-end rounded-t-sm transition-all duration-100",
                      isDimmed && "opacity-30",
                    )}
                    style={{ height: "100%" }}
                    onMouseEnter={(e) => {
                      setHoveredBar(i)
                      const rect = e.currentTarget.getBoundingClientRect()
                      setTooltipPos({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      })
                    }}
                    onMouseLeave={() => {
                      setHoveredBar(null)
                      setTooltipPos(null)
                    }}
                    onClick={() => onBarClick(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onBarClick(i)
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "w-full rounded-t-[1px] transition-colors duration-100",
                        isHovered || isSelected
                          ? "bg-[#ef3737]/70"
                          : "bg-[#ef3737]/40",
                      )}
                      style={{ height: `${ePct}%` }}
                    />
                    <div
                      className={cn(
                        "w-full transition-colors duration-100",
                        isHovered || isSelected
                          ? "bg-success/80"
                          : "bg-success/50",
                      )}
                      style={{ height: `${sPct}%` }}
                    />
                  </div>
                )
              })}
            </div>

            <div className="relative mt-2 h-4">
              {xLabels.map((label) => (
                <span
                  key={label.barIndex}
                  className="absolute -translate-x-1/2 text-[10px] text-muted-foreground"
                  style={{
                    left: `${((label.barIndex + 0.5) / bars.length) * 100}%`,
                  }}
                >
                  {label.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BarTooltip({
  bar,
  isSelected,
}: {
  bar: ChartBarData
  isSelected: boolean
}) {
  const total = bar.success + bar.error
  const successPct =
    total > 0 ? ((bar.success / total) * 100).toFixed(1) : "0"
  const errorPct =
    total > 0 ? ((bar.error / total) * 100).toFixed(1) : "0"

  return (
    <div className="w-[200px] rounded-lg border border-white/10 bg-[#1c1c1c] px-3.5 py-3 text-xs text-white shadow-xl">
      <div className="mb-2 text-[11px] font-medium text-white/50">
        {bar.timeStart} – {bar.timeEnd}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-white/60">Total</span>
          <span className="font-semibold">{total.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-white/60">Success</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {bar.success.toLocaleString()}
            </span>
            <span className="text-white/40">{successPct}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#ef3737]" />
            <span className="text-white/60">Errors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {bar.error.toLocaleString()}
            </span>
            <span className="text-white/40">{errorPct}%</span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 border-t border-white/10 pt-2 text-[10px] text-white/40">
        {isSelected ? "Click to clear filter" : "Click to filter"}
      </div>
    </div>
  )
}

function StatItem({
  dotColor,
  label,
  value,
  trend,
  trendColor,
}: {
  dotColor: string
  label: string
  value: string
  trend: string
  trendColor: string
}) {
  return (
    <div className="flex items-center gap-1.5 text-[12px]">
      <span className={cn("size-2 rounded-full", dotColor)} />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
      <span className={cn("font-medium", trendColor)}>{trend}</span>
    </div>
  )
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`
  return n.toLocaleString()
}

function computeGridLines(yMax: number): number[] {
  const step = Math.ceil(yMax / 3 / 100) * 100
  const lines: number[] = [0]
  let v = step
  while (v < yMax * 0.95) {
    lines.push(v)
    v += step
  }
  return lines
}
