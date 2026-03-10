import { useState, useRef, useCallback, useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { cn } from "@workspace/ui/lib/utils"

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: "top" | "bottom"
  align?: "center" | "start" | "end"
  className?: string
  delayMs?: number
}

export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  className,
  delayMs = 300,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({
        x:
          align === "start"
            ? rect.left
            : align === "end"
              ? rect.right
              : rect.left + rect.width / 2,
        y: side === "top" ? rect.top - 6 : rect.bottom + 6,
      })
      setVisible(true)
    }, delayMs)
  }, [delayMs, side, align])

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(false)
  }, [])

  if (!content) return <>{children}</>

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-flex max-w-full"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            className={cn(
              "pointer-events-none fixed z-[9999] w-max max-w-[280px] rounded-md bg-[#1c1c1c] px-2.5 py-1.5 text-xs leading-relaxed text-white shadow-lg",
              side === "top" && "-translate-y-full",
              align === "center" && "-translate-x-1/2",
              align === "end" && "-translate-x-full",
              className,
            )}
            style={{ left: pos.x, top: pos.y }}
            role="tooltip"
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  )
}
