import { useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { motion, AnimatePresence } from "motion/react"
import {
  X,
  Copy,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Info,
  Settings,
} from "lucide-react"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
type StatusCode = number

export interface LogEntryDetail {
  date: string
  time: string
  daysAgo: number
  provider: string
  providerVersion: string
  providerIcon: string
  originOwner: string
  source: string
  sourceIcon: string
  method: HttpMethod
  resource: string
  path: string
  duration: string
  status: StatusCode
  count: number
  organization: string
  url: string
  expires: string
  responseStatus: StatusCode
}

interface LogDetailPanelProps {
  log: LogEntryDetail | null
  open: boolean
  selectedIndex: number | null
  direction: "prev" | "next" | null
  onClose: () => void
  onNavigate: (direction: "prev" | "next") => void
}

const CONTENT_SLIDE_DISTANCE = 40

export function LogDetailPanel({
  log,
  open,
  selectedIndex,
  direction,
  onClose,
  onNavigate,
}: LogDetailPanelProps) {
  return (
    <AnimatePresence>
      {open && log && (
        <>
          <motion.div
            className="fixed inset-0 z-10 bg-black/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute top-3 right-3 bottom-3 z-20 flex w-[80%] flex-col overflow-hidden rounded-xl bg-white shadow-lg"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedIndex}
                className="flex min-h-0 flex-1 flex-col"
                initial={
                  direction
                    ? {
                        y: direction === "next" ? CONTENT_SLIDE_DISTANCE : -CONTENT_SLIDE_DISTANCE,
                        opacity: 0,
                      }
                    : false
                }
                animate={{ y: 0, opacity: 1 }}
                exit={
                  direction
                    ? {
                        y: direction === "next" ? -CONTENT_SLIDE_DISTANCE : CONTENT_SLIDE_DISTANCE,
                        opacity: 0,
                      }
                    : { opacity: 0 }
                }
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <DetailHeader log={log} onClose={onClose} />
                <MetadataRow log={log} />
                <UrlBar url={log.url} />
                <DetailTabs />
                <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6">
                  <div className="flex flex-col gap-5">
                    <RequestSection method={log.method} />
                    <ResponseSection status={log.responseStatus} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <DetailFooter onClose={onClose} onNavigate={onNavigate} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function DetailHeader({
  log,
  onClose,
}: {
  log: LogEntryDetail
  onClose: () => void
}) {
  const isSuccess = log.status >= 200 && log.status < 300

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3.5">
      <div className="flex items-center gap-2.5">
        <MethodBadge method={log.method} />
        <span className="text-sm font-semibold text-foreground">
          CRM | {log.resource}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-muted-foreground">{log.date}</span>
        <span className="text-[13px] text-muted-foreground">{log.time}</span>
        <span className="text-[13px] text-muted-foreground">
          {log.duration}
        </span>
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold",
            isSuccess
              ? "bg-success text-white"
              : "bg-[#ef3737] text-white"
          )}
        >
          {log.status}
        </span>
        <button
          onClick={onClose}
          className="ml-1 flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

function MetadataRow({ log }: { log: LogEntryDetail }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 border-b border-border px-6 py-3.5 text-[13px]">
      <MetadataItem label="Provider">
        <ProviderIcon type={log.providerIcon} />
        <span>{log.provider}</span>
      </MetadataItem>
      <MetadataItem label="Organization">
        <span>{log.organization}</span>
      </MetadataItem>
      <MetadataItem label="Source">
        <SourceIcon />
        <span>{log.source}</span>
      </MetadataItem>
      <MetadataItem label="Expires">
        <Clock className="size-3.5 text-success-foreground" />
        <span>{log.expires}</span>
        <span className="size-1.5 rounded-full bg-success" />
      </MetadataItem>
    </div>
  )
}

function MetadataItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5 font-medium text-foreground">
        {children}
      </div>
    </div>
  )
}

function UrlBar({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-3.5">
      <span className="shrink-0 text-[13px] font-medium text-muted-foreground">
        URL
      </span>
      <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground">
        {url}
      </code>
      <button
        onClick={handleCopy}
        className="flex size-6 shrink-0 items-center justify-center rounded transition-colors hover:bg-muted"
        title={copied ? "Copied!" : "Copy URL"}
      >
        <Copy className="size-3.5 text-muted-foreground" />
      </button>
    </div>
  )
}

function DetailTabs() {
  const [activeTab, setActiveTab] = useState<"details" | "underlying">(
    "details"
  )

  return (
    <div className="flex shrink-0 gap-1 border-b border-border px-6">
      <button
        onClick={() => setActiveTab("details")}
        className={cn(
          "relative px-1 py-3 text-sm font-medium transition-colors",
          activeTab === "details"
            ? "text-success-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Details
        {activeTab === "details" && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-success" />
        )}
      </button>
      <button
        onClick={() => setActiveTab("underlying")}
        className={cn(
          "relative ml-4 px-1 py-3 text-sm font-medium transition-colors",
          activeTab === "underlying"
            ? "text-success-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Underlying Requests
        {activeTab === "underlying" && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-success" />
        )}
      </button>
    </div>
  )
}

function RequestSection({ method }: { method: HttpMethod }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-3.5"
      >
        <span className="text-sm font-semibold text-foreground">Request</span>
        <div className="flex items-center gap-2">
          <MethodBadge method={method} />
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              !expanded && "-rotate-90"
            )}
          />
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border">
          <CollapsibleItem label="Headers" />
          <CollapsibleItem label="Query Parameters" />
          <CollapsibleItem label="Body" isLast />
        </div>
      )}
    </div>
  )
}

function ResponseSection({ status }: { status: StatusCode }) {
  const [expanded, setExpanded] = useState(true)
  const isSuccess = status >= 200 && status < 300

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-3.5"
      >
        <span className="text-sm font-semibold text-foreground">Response</span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold",
              isSuccess
                ? "bg-success text-white"
                : "bg-[#ef3737] text-white"
            )}
          >
            {status}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              !expanded && "-rotate-90"
            )}
          />
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border">
          <CollapsibleItem label="Headers" />
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="size-3.5 text-muted-foreground" />
              <span className="text-[13px] text-foreground">Body</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-muted-foreground">
                Not available
              </span>
              <Info className="size-3 text-muted-foreground/50" />
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="size-3.5 text-muted-foreground" />
              <Sparkles className="size-3.5 text-success-foreground" />
              <span className="text-[13px] font-medium text-success-foreground underline">
                Error Explainer
              </span>
              <span className="text-[12px] text-muted-foreground">
                ✦ Open to Generate
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground">
                via{" "}
                <span className="underline">Advanced Logs</span>
                {" & "}
                <span className="underline">AI Features</span>
              </span>
              <Settings className="size-3 text-muted-foreground/50" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CollapsibleItem({
  label,
  isLast,
}: {
  label: string
  isLast?: boolean
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 px-5 py-3",
        !isLast && "border-b border-border"
      )}
    >
      <ChevronRight className="size-3.5 text-muted-foreground" />
      <span className="text-[13px] text-foreground">{label}</span>
    </button>
  )
}

function DetailFooter({
  onClose,
  onNavigate,
}: {
  onClose: () => void
  onNavigate: (direction: "prev" | "next") => void
}) {
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-3">
      <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNavigate("prev")}
            className="flex size-6 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
          >
            <ArrowUp className="size-3" />
          </button>
          <button
            onClick={() => onNavigate("next")}
            className="flex size-6 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
          >
            <ArrowDown className="size-3" />
          </button>
        </div>
        <span>Navigate</span>
        <div className="flex items-center gap-1.5">
          <kbd className="flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
          <span>Close</span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="rounded-lg border border-border px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
      >
        Close
      </button>
    </div>
  )
}

function MethodBadge({ method }: { method: HttpMethod }) {
  const colors: Record<HttpMethod, string> = {
    GET: "bg-success/10 text-success-foreground",
    POST: "bg-[#ef3737]/10 text-[#ef3737]",
    PUT: "bg-[#f59e0b]/10 text-[#b45309]",
    DELETE: "bg-[#ef3737]/10 text-[#ef3737]",
    PATCH: "bg-[#8b5cf6]/10 text-[#6d28d9]",
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[11px] font-bold",
        colors[method]
      )}
    >
      {method}
    </span>
  )
}

function ProviderIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    green: "bg-[#22c55e]",
    blue: "bg-[#3b82f6]",
    dark: "bg-[#374151]",
    red: "bg-[#ef4444]",
    orange: "bg-[#f97316]",
  }

  return (
    <div
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white",
        colors[type] ?? "bg-muted"
      )}
    >
      {type.charAt(0).toUpperCase()}
    </div>
  )
}

function SourceIcon() {
  return (
    <div className="flex size-5 shrink-0 items-center justify-center rounded border border-border bg-muted/50">
      <div className="size-2.5 rounded-sm bg-muted-foreground/30" />
    </div>
  )
}
