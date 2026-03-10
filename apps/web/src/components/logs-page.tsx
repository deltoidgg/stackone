import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@workspace/ui/lib/utils"
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Filter,
  Clock,
  CalendarDays,
  Check,
} from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { LogDetailPanel, type LogEntryDetail } from "@/components/log-detail-panel"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
type StatusCode = number

interface LogEntry {
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

function formatRelativeTime(daysAgo: number): string {
  if (daysAgo === 0) return "Today"
  if (daysAgo === 1) return "Yesterday"
  if (daysAgo < 7) return `${daysAgo} days ago`
  if (daysAgo < 14) return "1 week ago"
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`
  return `${Math.floor(daysAgo / 30)} months ago`
}

const SAMPLE_LOGS: LogEntry[] = [
  { date: "Aug 13", time: "21:05:19.123", daysAgo: 0, provider: "Atlas", providerVersion: "V1.0.0", providerIcon: "green", originOwner: "StackOne Interviews", source: "Test Connection", sourceIcon: "link", method: "GET", resource: "List Employees", path: "/employees/applications/candidates", duration: "583 ms", status: 200, count: 0, organization: "Sample Organization", url: "https://api.stackone.com/unified/hris/employees", expires: "6 Days", responseStatus: 200 },
  { date: "Aug 12", time: "21:05:19.123", daysAgo: 1, provider: "Atlas", providerVersion: "V1.0.0", providerIcon: "blue", originOwner: "StackOne Interviews", source: "Identifier 1", sourceIcon: "lock", method: "POST", resource: "List Employees", path: "/unified/ats/applications", duration: "224 ms", status: 200, count: 2, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "6 Days", responseStatus: 200 },
  { date: "Aug 09", time: "21:05:19.123", daysAgo: 4, provider: "Atlas", providerVersion: "V1.0.0", providerIcon: "dark", originOwner: "StackOne Interviews", source: "Key", sourceIcon: "key", method: "GET", resource: "List Employees", path: "/unified/ats/applications", duration: "247 ms", status: 200, count: 3, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "3 Days", responseStatus: 200 },
  { date: "Aug 08", time: "21:05:19.123", daysAgo: 5, provider: "Atlas", providerVersion: "V1.0.0", providerIcon: "dark", originOwner: "StackOne Interviews", source: "Identifier 1", sourceIcon: "lock", method: "POST", resource: "List Employees", path: "/unified/ats/applications", duration: "205 ms", status: 401, count: 3, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "2 Days", responseStatus: 401 },
  { date: "Aug 06", time: "21:05:19.123", daysAgo: 7, provider: "Humaans", providerVersion: "V1.0.0", providerIcon: "red", originOwner: "StackOne Interviews", source: "Refresh Token", sourceIcon: "refresh", method: "GET", resource: "List Employees", path: "/unified/ats/applications", duration: "154 ms", status: 200, count: 2, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "6 Days", responseStatus: 200 },
  { date: "Aug 13", time: "21:05:19.123", daysAgo: 0, provider: "Atlas", providerVersion: "V1.0.0", providerIcon: "green", originOwner: "StackOne Interviews", source: "Test Connection", sourceIcon: "link", method: "GET", resource: "List Employees", path: "/unified/ats/applications", duration: "583 ms", status: 200, count: 0, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "6 Days", responseStatus: 200 },
  { date: "Aug 12", time: "21:05:19.123", daysAgo: 1, provider: "Atlas", providerVersion: "V1.0.0", providerIcon: "blue", originOwner: "StackOne Interviews", source: "Identifier 1", sourceIcon: "lock", method: "POST", resource: "List Employees", path: "/unified/ats/applications", duration: "224 ms", status: 200, count: 5, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "6 Days", responseStatus: 200 },
  { date: "Aug 09", time: "21:05:19.123", daysAgo: 4, provider: "Atlas", providerVersion: "V1.0.0", providerIcon: "dark", originOwner: "StackOne Interviews", source: "Test Mapping", sourceIcon: "map", method: "GET", resource: "List Employees", path: "/unified/ats/applications", duration: "247 ms", status: 200, count: 3, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "3 Days", responseStatus: 200 },
  { date: "Aug 06", time: "21:05:19.123", daysAgo: 7, provider: "Humaans", providerVersion: "V1.0.0", providerIcon: "orange", originOwner: "StackOne Interviews", source: "Refresh Token", sourceIcon: "refresh", method: "GET", resource: "List Employees", path: "/unified/ats/applications", duration: "154 ms", status: 200, count: 2, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "6 Days", responseStatus: 200 },
  { date: "Aug 13", time: "21:05:19.123", daysAgo: 0, provider: "Atlas", providerVersion: "V1.0.0", providerIcon: "green", originOwner: "StackOne Interviews", source: "Test Connection", sourceIcon: "link", method: "GET", resource: "List Employees", path: "/unified/ats/applications", duration: "583 ms", status: 200, count: 0, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "6 Days", responseStatus: 200 },
  { date: "Aug 12", time: "21:05:19.123", daysAgo: 1, provider: "Atlas", providerVersion: "V1.0.0", providerIcon: "blue", originOwner: "StackOne Interviews", source: "Identifier 1", sourceIcon: "lock", method: "POST", resource: "List Employees", path: "/unified/ats/applications", duration: "224 ms", status: 200, count: 5, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "6 Days", responseStatus: 200 },
  { date: "Aug 09", time: "21:05:19.123", daysAgo: 4, provider: "Atlas", providerVersion: "V1.0.0", providerIcon: "dark", originOwner: "StackOne Interviews", source: "Test Mapping", sourceIcon: "map", method: "GET", resource: "List Employees", path: "/unified/ats/applications", duration: "247 ms", status: 200, count: 3, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "3 Days", responseStatus: 200 },
  { date: "Aug 08", time: "21:05:19.123", daysAgo: 5, provider: "Humaans", providerVersion: "V1.0.0", providerIcon: "red", originOwner: "StackOne Interviews", source: "Identifier 1", sourceIcon: "lock", method: "POST", resource: "List Employees", path: "/unified/ats/applications", duration: "205 ms", status: 401, count: 0, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "2 Days", responseStatus: 401 },
  { date: "Aug 06", time: "21:05:19.123", daysAgo: 7, provider: "Atlas", providerVersion: "V1.0.0", providerIcon: "green", originOwner: "StackOne Interviews", source: "Test Connection", sourceIcon: "link", method: "GET", resource: "List Employees", path: "/unified/ats/applications", duration: "154 ms", status: 200, count: 3, organization: "Sample Organization", url: "https://api.stackone.com/unified/ats/applications", expires: "6 Days", responseStatus: 200 },
]

const TIME_LABELS = [
  "15:10", "15:11", "15:12", "15:13", "15:14",
  "15:15", "15:16", "15:17", "15:18",
]

const BARS_PER_GROUP = 9

function generateChartData() {
  const success: number[] = []
  const error: number[] = []
  for (let g = 0; g < TIME_LABELS.length; g++) {
    for (let b = 0; b < BARS_PER_GROUP; b++) {
      const base = 150 + Math.floor(Math.random() * 250)
      const spike = Math.random() > 0.85 ? Math.floor(Math.random() * 600) : 0
      success.push(base + spike)
      error.push(
        Math.random() > 0.7
          ? 30 + Math.floor(Math.random() * 120)
          : 10 + Math.floor(Math.random() * 40)
      )
    }
  }
  return { success, error }
}

const CHART = generateChartData()

export function LogsPage() {
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null)
  const [navDirection, setNavDirection] = useState<"prev" | "next" | null>(null)
  const [showRelativeTime, setShowRelativeTime] = useState(true)
  const [methodFilters, setMethodFilters] = useState<Set<HttpMethod>>(new Set())
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "error">("all")
  const panelOpen = selectedLogIndex !== null

  const filteredLogs = SAMPLE_LOGS.filter((log) => {
    if (methodFilters.size > 0 && !methodFilters.has(log.method)) return false
    if (statusFilter === "success" && log.status >= 400) return false
    if (statusFilter === "error" && log.status < 400) return false
    return true
  })

  const selectedLog: LogEntryDetail | null =
    selectedLogIndex !== null ? filteredLogs[selectedLogIndex] : null

  const handleRowClick = useCallback((index: number) => {
    setNavDirection(null)
    setSelectedLogIndex(index)
  }, [])

  const handleClose = useCallback(() => {
    setNavDirection(null)
    setSelectedLogIndex(null)
  }, [])

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      setNavDirection(direction)
      setSelectedLogIndex((prev) => {
        if (prev === null) return null
        if (direction === "prev") return Math.max(0, prev - 1)
        return Math.min(filteredLogs.length - 1, prev + 1)
      })
    },
    [filteredLogs.length]
  )

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!panelOpen) return
      if (e.key === "Escape") {
        handleClose()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        handleNavigate("prev")
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        handleNavigate("next")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [panelOpen, handleClose, handleNavigate])

  const toggleMethodFilter = useCallback((method: HttpMethod) => {
    setMethodFilters((prev) => {
      const next = new Set(prev)
      if (next.has(method)) next.delete(method)
      else next.add(method)
      return next
    })
    setSelectedLogIndex(null)
  }, [])

  const handleStatusFilter = useCallback((filter: "all" | "success" | "error") => {
    setStatusFilter(filter)
    setSelectedLogIndex(null)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#fafafa] p-3">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm">
          <Header />
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-5 pb-4">
            <div className="shrink-0"><Toolbar /></div>
            <div className="shrink-0"><ChartSection /></div>
            <LogsTable
              logs={filteredLogs}
              selectedIndex={selectedLogIndex}
              onRowClick={handleRowClick}
              showRelativeTime={showRelativeTime}
              onToggleTimeDisplay={() => setShowRelativeTime((v) => !v)}
              methodFilters={methodFilters}
              onToggleMethodFilter={toggleMethodFilter}
              statusFilter={statusFilter}
              onStatusFilter={handleStatusFilter}
            />
            <div className="shrink-0"><Pagination total={34} page={1} pageSize={25} /></div>
          </div>
        </div>
        <LogDetailPanel
          log={selectedLog}
          open={panelOpen}
          selectedIndex={selectedLogIndex}
          direction={navDirection}
          onClose={handleClose}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="flex h-[50px] shrink-0 items-center px-5">
      <h1 className="text-base font-semibold text-foreground">Logs</h1>
    </div>
  )
}

function Toolbar() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-white px-2.5 py-1.5">
        <Search className="size-3.5 text-muted-foreground" />
        <span className="text-[13px] text-muted-foreground">Search...</span>
      </div>

      <Divider />

      <ToolbarButton>
        Daily
        <ChevronDown className="size-3 text-muted-foreground" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton>
        <span className="text-muted-foreground">Start Time</span>
      </ToolbarButton>

      <Divider />

      <ToolbarButton>
        <span className="text-muted-foreground">End Time</span>
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-[13px] font-medium text-foreground">
          Hide Background Logs
        </span>
        <Toggle enabled={true} />
      </div>
    </div>
  )
}

function ToolbarButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted">
      {children}
    </button>
  )
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <button
      className={cn(
        "flex h-[18px] w-[32px] items-center rounded-full p-[2px] transition-colors",
        enabled ? "justify-end bg-success" : "bg-[#e8e8e8]"
      )}
    >
      <div className="size-[14px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,35,11,0.2)]" />
    </button>
  )
}

function Divider() {
  return <div className="h-4 w-px shrink-0 bg-border" />
}

function ChartSection() {
  const gridLines = [0, 1000, 2000]
  const yMax = 2400

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
            value="580,000"
            trend="— 0%"
            trendColor="text-muted-foreground"
          />
          <StatItem
            dotColor="bg-success"
            label="Success"
            value="580,000"
            trend="↑ 2%"
            trendColor="text-success-foreground"
          />
          <StatItem
            dotColor="bg-[#ef3737]/70"
            label="Error"
            value="20,000"
            trend="↓ 2%"
            trendColor="text-[#ef3737]"
          />
        </div>
      </div>

      <div className="mx-3 mb-3 rounded-lg bg-white">
        <div className="flex">
          <div className="flex w-8 shrink-0 flex-col-reverse justify-between py-4 pr-1.5 text-right text-[10px] text-muted-foreground">
            {gridLines.map((v) => (
              <span key={v}>
                {v >= 1000 ? `${v / 1000}k` : `${v}k`}
              </span>
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

            <div className="relative flex h-[160px] items-end gap-px">
              {CHART.success.map((sVal, i) => {
                const eVal = CHART.error[i]
                const ePct = (eVal / yMax) * 100
                const sPct = (sVal / yMax) * 100

                return (
                  <div
                    key={i}
                    className="flex min-w-0 flex-1 flex-col justify-end"
                    style={{ height: "100%" }}
                  >
                    <div
                      className="w-full rounded-t-[1px] bg-[#ef3737]/50"
                      style={{ height: `${ePct}%` }}
                    />
                    <div
                      className="w-full bg-success/60"
                      style={{ height: `${sPct}%` }}
                    />
                  </div>
                )
              })}
            </div>

            <div className="mt-2 flex">
              {TIME_LABELS.map((label, gi) => (
                <div
                  key={gi}
                  className="flex-1 text-center text-[10px] text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
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

function LogsTable({
  logs,
  selectedIndex,
  onRowClick,
  showRelativeTime,
  onToggleTimeDisplay,
  methodFilters,
  onToggleMethodFilter,
  statusFilter,
  onStatusFilter,
}: {
  logs: LogEntry[]
  selectedIndex: number | null
  onRowClick: (index: number) => void
  showRelativeTime: boolean
  onToggleTimeDisplay: () => void
  methodFilters: Set<HttpMethod>
  onToggleMethodFilter: (method: HttpMethod) => void
  statusFilter: "all" | "success" | "error"
  onStatusFilter: (filter: "all" | "success" | "error") => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-[#f8f8f8]">
      <div className="shrink-0 px-3">
        <div className="flex items-center py-3 text-[13px] font-semibold text-foreground">
          <TimeColumnHeader
            className="w-[150px]"
            showRelativeTime={showRelativeTime}
            onToggle={onToggleTimeDisplay}
          />
          <SortHeader className="w-[190px]">Account</SortHeader>
          <SortHeader className="w-[140px]">Source</SortHeader>
          <MethodFilterHeader
            className="min-w-0 flex-1"
            methodFilters={methodFilters}
            onToggle={onToggleMethodFilter}
          />
          <div className="flex w-[32px] shrink-0 items-center justify-center">
            <button className="flex size-5 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted">
              <Plus className="size-3" />
            </button>
          </div>
          <SortHeader className="w-[90px]">Duration</SortHeader>
          <StatusFilterHeader
            className="w-[80px]"
            statusFilter={statusFilter}
            onFilter={onStatusFilter}
          />
          <div className="w-[90px] shrink-0" />
        </div>
      </div>

      <div className="mx-3 mb-3 min-h-0 flex-1 overflow-y-auto rounded-lg bg-white">
        <div className="min-w-[1000px]">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-[13px] text-muted-foreground">
              No logs match the current filters
            </div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                onClick={() => onRowClick(i)}
                className={cn(
                  "group flex cursor-pointer items-center border-b border-border text-[13px] transition-colors last:border-b-0 hover:bg-muted/20",
                  selectedIndex === i && "bg-success/5"
                )}
              >
                <div className="w-[150px] shrink-0 px-4 py-2.5">
                  <span
                    className="whitespace-nowrap text-muted-foreground"
                    title={
                      showRelativeTime
                        ? `${log.date} | ${log.time}`
                        : formatRelativeTime(log.daysAgo)
                    }
                  >
                    {showRelativeTime ? (
                      formatRelativeTime(log.daysAgo)
                    ) : (
                      <>
                        {log.date}
                        <span className="mx-1.5 text-muted-foreground/30">|</span>
                        {log.time}
                      </>
                    )}
                  </span>
                </div>
                <div className="w-[190px] shrink-0 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <ProviderIcon type={log.providerIcon} />
                    <span className="truncate text-muted-foreground">
                      {log.organization}
                    </span>
                  </div>
                </div>
                <div className="w-[140px] shrink-0 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <SourceIcon />
                    <span className="truncate text-muted-foreground">
                      {log.source}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 px-4 py-2.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MethodBadge method={log.method} />
                    <span className="shrink-0 text-muted-foreground">{log.resource}</span>
                    <span className="truncate text-muted-foreground/50">{log.path}</span>
                  </div>
                </div>
                <div className="w-[32px] shrink-0" />
                <div className="w-[90px] shrink-0 px-4 py-2.5">
                  <span className="text-muted-foreground">{log.duration}</span>
                </div>
                <div className="w-[80px] shrink-0 px-4 py-2.5">
                  <StatusBadge code={log.status} />
                </div>
                <div className="flex w-[90px] shrink-0 items-center justify-end gap-2 px-3 py-2.5">
                  <span className="text-[12px] text-muted-foreground/60">{log.count}</span>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex size-6 items-center justify-center rounded transition-colors hover:bg-muted"
                  >
                    <MoreHorizontal className="size-3.5 text-muted-foreground/50" />
                  </button>
                  <ChevronRight className="size-3.5 text-muted-foreground/40" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function TimeColumnHeader({
  className,
  showRelativeTime,
  onToggle,
}: {
  className?: string
  showRelativeTime: boolean
  onToggle: () => void
}) {
  return (
    <div className={cn("shrink-0 px-4", className)}>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 transition-colors hover:text-foreground"
        title={showRelativeTime ? "Switch to timestamps" : "Switch to relative time"}
      >
        {showRelativeTime ? (
          <Clock className="size-3 text-muted-foreground" />
        ) : (
          <CalendarDays className="size-3 text-muted-foreground" />
        )}
        <span>Requested</span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </button>
    </div>
  )
}

function MethodFilterHeader({
  className,
  methodFilters,
  onToggle,
}: {
  className?: string
  methodFilters: Set<HttpMethod>
  onToggle: (method: HttpMethod) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const hasFilter = methodFilters.size > 0
  const methods: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className={cn("relative shrink-0 px-4", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1"
      >
        <span>Request</span>
        {hasFilter ? (
          <Filter className="size-3 text-success-foreground" />
        ) : (
          <ChevronDown className="size-3 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="absolute top-full left-4 z-30 mt-1 w-[140px] rounded-lg border border-border bg-white py-1 shadow-lg">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => onToggle(m)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-[12px] transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <MethodBadge method={m} />
              </div>
              {methodFilters.has(m) && (
                <Check className="size-3 text-success-foreground" />
              )}
            </button>
          ))}
          {hasFilter && (
            <>
              <div className="my-1 border-t border-border" />
              <button
                onClick={() => {
                  methods.forEach((m) => { if (methodFilters.has(m)) onToggle(m) })
                  setOpen(false)
                }}
                className="w-full px-3 py-1.5 text-left text-[12px] text-muted-foreground transition-colors hover:bg-muted/50"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function StatusFilterHeader({
  className,
  statusFilter,
  onFilter,
}: {
  className?: string
  statusFilter: "all" | "success" | "error"
  onFilter: (filter: "all" | "success" | "error") => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const hasFilter = statusFilter !== "all"

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const options: { value: "all" | "success" | "error"; label: string }[] = [
    { value: "all", label: "All statuses" },
    { value: "success", label: "Success (2xx)" },
    { value: "error", label: "Errors (4xx+)" },
  ]

  return (
    <div ref={ref} className={cn("relative shrink-0 px-4", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1"
      >
        <span>Status</span>
        {hasFilter ? (
          <Filter className="size-3 text-success-foreground" />
        ) : (
          <ChevronDown className="size-3 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="absolute top-full right-0 z-30 mt-1 w-[150px] rounded-lg border border-border bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onFilter(opt.value); setOpen(false) }}
              className="flex w-full items-center justify-between px-3 py-1.5 text-[12px] transition-colors hover:bg-muted/50"
            >
              <span>{opt.label}</span>
              {statusFilter === opt.value && (
                <Check className="size-3 text-success-foreground" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SortHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("shrink-0 px-4", className)}>
      <div className="flex items-center gap-1">
        <span>{children}</span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </div>
    </div>
  )
}

function MethodBadge({ method }: { method: HttpMethod }) {
  const colors: Record<HttpMethod, string> = {
    GET: "bg-success/10 text-success-foreground",
    POST: "bg-[#3b82f6]/10 text-[#3b82f6]",
    PUT: "bg-[#f59e0b]/10 text-[#b45309]",
    DELETE: "bg-[#ef3737]/10 text-[#ef3737]",
    PATCH: "bg-[#8b5cf6]/10 text-[#6d28d9]",
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[11px] font-semibold",
        colors[method]
      )}
    >
      {method}
    </span>
  )
}

function StatusBadge({ code }: { code: StatusCode }) {
  const isSuccess = code >= 200 && code < 300

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[11px] font-semibold",
        isSuccess
          ? "bg-success/10 text-success-foreground"
          : "bg-[#ef3737]/10 text-[#ef3737]"
      )}
    >
      {code}
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
        "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
        colors[type] ?? "bg-muted"
      )}
    >
      S
    </div>
  )
}

function SourceIcon() {
  return (
    <div className="flex size-5 shrink-0 items-center justify-center rounded border border-border bg-muted/30">
      <div className="size-2.5 rounded-sm bg-muted-foreground/30" />
    </div>
  )
}

function Pagination({
  total,
  page,
  pageSize,
}: {
  total: number
  page: number
  pageSize: number
}) {
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex items-center justify-center gap-4 py-2 text-[13px] text-muted-foreground">
      <span>
        Total {total} Items
      </span>

      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          className="flex size-7 items-center justify-center rounded border border-border transition-colors hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={cn(
              "flex size-7 items-center justify-center rounded border text-[13px] font-medium transition-colors",
              p === page
                ? "border-success bg-success/10 text-success-foreground"
                : "border-border hover:bg-muted"
            )}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page >= totalPages}
          className="flex size-7 items-center justify-center rounded border border-border transition-colors hover:bg-muted disabled:opacity-40"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      <span>{pageSize} / page</span>

      <div className="flex items-center gap-1.5">
        <span>Go to</span>
        <input
          type="text"
          className="w-12 rounded border border-border bg-white px-2 py-0.5 text-center text-[13px] text-foreground outline-none focus:border-success"
        />
        <span>Page</span>
      </div>
    </div>
  )
}
