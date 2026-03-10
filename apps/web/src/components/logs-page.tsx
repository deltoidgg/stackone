import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Tooltip } from "@workspace/ui/components/tooltip"
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Filter,
  Clock,
  CalendarDays,
  Check,
  X,
  Building2,
} from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { LogDetailPanel, type LogEntryDetail } from "@/components/log-detail-panel"
import {
  ChartSection,
  type ChartBarData,
  type ChartXLabel,
  type HttpMethod,
} from "@/components/chart-section"

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

const STATUS_TEXT: Record<number, string> = {
  200: "OK – Request succeeded",
  201: "Created – Resource created",
  204: "No Content",
  400: "Bad Request – Invalid parameters",
  401: "Unauthorized – Authentication required",
  403: "Forbidden – Insufficient permissions",
  404: "Not Found – Resource does not exist",
  429: "Too Many Requests – Rate limited",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
}

// ---------------------------------------------------------------------------
// Deterministic data generation
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CHART_START_SECONDS = 15 * 3600 + 10 * 60 // 15:10:00
const CHART_BUCKET_SECONDS = 15
const CHART_TOTAL_BARS = 40

function formatSecondsToTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function timeToSeconds(time: string): number {
  const parts = time.split(":")
  const h = parseInt(parts[0])
  const m = parseInt(parts[1])
  const s = parseFloat(parts[2])
  return h * 3600 + m * 60 + s
}

const PROVIDERS = [
  { name: "Atlas", icon: "green", version: "V1.0.0" },
  { name: "Humaans", icon: "red", version: "V1.0.0" },
  { name: "BambooHR", icon: "blue", version: "V2.1.0" },
  { name: "Workday", icon: "dark", version: "V1.2.0" },
  { name: "Personio", icon: "orange", version: "V1.0.0" },
]

const ENDPOINTS: { method: HttpMethod; resource: string; path: string }[] = [
  { method: "GET", resource: "List Employees", path: "/unified/hris/employees" },
  { method: "GET", resource: "Get Employee", path: "/unified/hris/employees/{id}" },
  { method: "POST", resource: "Create Employee", path: "/unified/hris/employees" },
  { method: "GET", resource: "List Applications", path: "/unified/ats/applications" },
  { method: "POST", resource: "Create Application", path: "/unified/ats/applications" },
  { method: "PUT", resource: "Update Job", path: "/unified/ats/jobs/{id}" },
  { method: "GET", resource: "List Jobs", path: "/unified/ats/jobs" },
  { method: "DELETE", resource: "Delete Candidate", path: "/unified/ats/candidates/{id}" },
  { method: "PATCH", resource: "Update Employee", path: "/unified/hris/employees/{id}" },
  { method: "GET", resource: "List Contacts", path: "/unified/crm/contacts" },
  { method: "POST", resource: "Create Contact", path: "/unified/crm/contacts" },
  { method: "GET", resource: "List Accounts", path: "/unified/crm/accounts" },
]

const SOURCES = [
  { name: "Test Connection", icon: "link" },
  { name: "Identifier 1", icon: "lock" },
  { name: "API Key", icon: "key" },
  { name: "Refresh Token", icon: "refresh" },
  { name: "Test Mapping", icon: "map" },
  { name: "Webhook", icon: "link" },
]

const ORGS = [
  "Sample Organization",
  "Acme Corp",
  "TechFlow Inc",
  "DataSync Labs",
]

const STATUS_POOL = [
  200, 200, 200, 200, 200, 200, 201, 201, 204, 400, 401, 403, 404, 500,
]

function generateLogs(): LogEntry[] {
  const rng = mulberry32(42)
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
  const logs: LogEntry[] = []
  const totalSeconds = CHART_TOTAL_BARS * CHART_BUCKET_SECONDS

  for (let i = 0; i < 120; i++) {
    const provider = pick(PROVIDERS)
    const endpoint = pick(ENDPOINTS)
    const source = pick(SOURCES)
    const status = pick(STATUS_POOL)

    const offsetSec = rng() * totalSeconds
    const absSeconds = CHART_START_SECONDS + offsetSec
    const h = Math.floor(absSeconds / 3600)
    const m = Math.floor((absSeconds % 3600) / 60)
    const s = Math.floor(absSeconds % 60)
    const ms = Math.floor(rng() * 1000)
    const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`

    logs.push({
      date: "Mar 10",
      time,
      daysAgo: 0,
      provider: provider.name,
      providerVersion: provider.version,
      providerIcon: provider.icon,
      originOwner: "StackOne Interviews",
      source: source.name,
      sourceIcon: source.icon,
      method: endpoint.method,
      resource: endpoint.resource,
      path: endpoint.path,
      duration: `${80 + Math.floor(rng() * 850)} ms`,
      status,
      count: Math.floor(rng() * 6),
      organization: pick(ORGS),
      url: `https://api.stackone.com${endpoint.path}`,
      expires: `${1 + Math.floor(rng() * 6)} Days`,
      responseStatus: status,
    })
  }

  return logs.sort((a, b) => a.time.localeCompare(b.time))
}

function generateChartData(): { bars: ChartBarData[]; xLabels: ChartXLabel[] } {
  const rng = mulberry32(7777)
  const bars: ChartBarData[] = []

  for (let i = 0; i < CHART_TOTAL_BARS; i++) {
    const startSec = CHART_START_SECONDS + i * CHART_BUCKET_SECONDS
    const endSec = startSec + CHART_BUCKET_SECONDS

    const activity = 0.5 + rng() * 1.0
    const spike = rng() > 0.9 ? 1.5 + rng() * 2 : 1
    const base = Math.floor(150 * activity * spike)
    const errRate = 0.03 + rng() * 0.12

    bars.push({
      timeStart: formatSecondsToTime(startSec),
      timeEnd: formatSecondsToTime(endSec),
      success: base,
      error: Math.max(3, Math.floor(base * errRate)),
    })
  }

  const xLabels: ChartXLabel[] = []
  for (let i = 0; i < CHART_TOTAL_BARS; i += 8) {
    const startSec = CHART_START_SECONDS + i * CHART_BUCKET_SECONDS
    const h = Math.floor(startSec / 3600)
    const m = Math.floor((startSec % 3600) / 60)
    xLabels.push({
      barIndex: i,
      label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    })
  }

  return { bars, xLabels }
}

const SAMPLE_LOGS = generateLogs()
const CHART = generateChartData()

const REFERENCE_NOW_SECONDS =
  CHART_START_SECONDS + CHART_TOTAL_BARS * CHART_BUCKET_SECONDS + 30

function formatRelativeTime(log: LogEntry): string {
  if (log.daysAgo > 0) {
    if (log.daysAgo === 1) return "yesterday"
    if (log.daysAgo < 7) return `${log.daysAgo} days ago`
    if (log.daysAgo < 14) return "1 week ago"
    if (log.daysAgo < 30) return `${Math.floor(log.daysAgo / 7)} weeks ago`
    return `${Math.floor(log.daysAgo / 30)} months ago`
  }
  const logSeconds = timeToSeconds(log.time)
  const diff = Math.max(0, REFERENCE_NOW_SECONDS - logSeconds)
  if (diff < 5) return "just now"
  if (diff < 60) return `${Math.floor(diff)}s ago`
  const mins = Math.floor(diff / 60)
  if (diff < 3600) return `${mins} min${mins !== 1 ? "s" : ""} ago`
  const hours = Math.floor(diff / 3600)
  return `${hours} hour${hours !== 1 ? "s" : ""} ago`
}

interface TopAccountEntry {
  organization: string
  providerIcon: string
  count: number
  avgDuration: number
}

function parseDuration(d: string): number {
  return parseInt(d.replace(/[^\d]/g, ""))
}

function computeTopAccounts(logs: LogEntry[]): TopAccountEntry[] {
  const byOrg = new Map<
    string,
    { count: number; totalDuration: number; providerIcon: string }
  >()

  for (const log of logs) {
    const entry = byOrg.get(log.organization) || {
      count: 0,
      totalDuration: 0,
      providerIcon: log.providerIcon,
    }
    entry.count++
    entry.totalDuration += parseDuration(log.duration)
    byOrg.set(log.organization, entry)
  }

  return Array.from(byOrg.entries())
    .map(([org, data]) => ({
      organization: org,
      providerIcon: data.providerIcon,
      count: data.count,
      avgDuration: Math.round(data.totalDuration / data.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function LogsPage() {
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null)
  const [navDirection, setNavDirection] = useState<"prev" | "next" | null>(null)
  const [showRelativeTime, setShowRelativeTime] = useState(true)
  const [methodFilters, setMethodFilters] = useState<Set<HttpMethod>>(new Set())
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "error">("all")
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [timeSortDirection, setTimeSortDirection] = useState<"desc" | "asc">(
    "desc",
  )

  const panelOpen = selectedLogIndex !== null
  const selectedBar =
    selectedBarIndex !== null ? CHART.bars[selectedBarIndex] : null

  const timeFilteredLogs = SAMPLE_LOGS.filter((log) => {
    if (selectedBar) {
      const logSec = timeToSeconds(log.time)
      const startSec = timeToSeconds(selectedBar.timeStart)
      const endSec = timeToSeconds(selectedBar.timeEnd)
      if (logSec < startSec || logSec >= endSec) return false
    }
    return true
  })

  const topAccounts = computeTopAccounts(timeFilteredLogs)

  const filteredLogs = timeFilteredLogs.filter((log) => {
    if (selectedAccount && log.organization !== selectedAccount) return false
    if (methodFilters.size > 0 && !methodFilters.has(log.method)) return false
    if (statusFilter === "success" && log.status >= 400) return false
    if (statusFilter === "error" && log.status < 400) return false
    return true
  })

  const displayLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      const aTime = timeToSeconds(a.time)
      const bTime = timeToSeconds(b.time)
      return timeSortDirection === "asc" ? aTime - bTime : bTime - aTime
    })
  }, [filteredLogs, timeSortDirection])

  const selectedLog: LogEntryDetail | null =
    selectedLogIndex !== null ? displayLogs[selectedLogIndex] : null

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
    [filteredLogs.length],
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

  const handleStatusFilter = useCallback(
    (filter: "all" | "success" | "error") => {
      setStatusFilter(filter)
      setSelectedLogIndex(null)
    },
    [],
  )

  const handleBarClick = useCallback((index: number) => {
    setSelectedBarIndex((prev) => (prev === index ? null : index))
    setSelectedLogIndex(null)
  }, [])

  const handleAccountClick = useCallback((org: string) => {
    setSelectedAccount((prev) => (prev === org ? null : org))
    setSelectedLogIndex(null)
  }, [])

  const handleTimeSort = useCallback(() => {
    setTimeSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    setSelectedLogIndex(null)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#fafafa] p-3">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm">
          <Header />
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-5 pb-4">
            <div className="shrink-0">
              <Toolbar
                showRelativeTime={showRelativeTime}
                onToggleTimeDisplay={() => setShowRelativeTime((v) => !v)}
              />
            </div>
            <div className="flex shrink-0 gap-4">
              <div className="min-w-0 flex-1">
                <ChartSection
                  bars={CHART.bars}
                  xLabels={CHART.xLabels}
                  selectedBarIndex={selectedBarIndex}
                  onBarClick={handleBarClick}
                />
              </div>
              <div className="w-[38%] max-w-[50%] shrink-0">
                <TopAccountsTable
                  accounts={topAccounts}
                  selectedAccount={selectedAccount}
                  onAccountClick={handleAccountClick}
                />
              </div>
            </div>
            {(selectedBar || selectedAccount) && (
              <div className="flex shrink-0 items-center gap-2">
                {selectedBar && (
                  <FilterChipPill
                    icon={<Clock className="size-3" />}
                    label={`${selectedBar.timeStart} – ${selectedBar.timeEnd}`}
                    onClear={() => {
                      setSelectedBarIndex(null)
                      setSelectedLogIndex(null)
                    }}
                  />
                )}
                {selectedAccount && (
                  <FilterChipPill
                    icon={<Building2 className="size-3" />}
                    label={selectedAccount}
                    onClear={() => {
                      setSelectedAccount(null)
                      setSelectedLogIndex(null)
                    }}
                  />
                )}
                <span className="text-[12px] text-muted-foreground">
                  Showing {filteredLogs.length} of {SAMPLE_LOGS.length} logs
                </span>
              </div>
            )}
            <LogsTable
              logs={displayLogs}
              selectedIndex={selectedLogIndex}
              onRowClick={handleRowClick}
              showRelativeTime={showRelativeTime}
              timeSortDirection={timeSortDirection}
              onTimeSort={handleTimeSort}
              methodFilters={methodFilters}
              onToggleMethodFilter={toggleMethodFilter}
              statusFilter={statusFilter}
              onStatusFilter={handleStatusFilter}
            />
            <div className="shrink-0">
              <Pagination
                total={displayLogs.length}
                page={1}
                pageSize={25}
              />
            </div>
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Header() {
  return (
    <div className="flex h-[50px] shrink-0 items-center px-5">
      <h1 className="text-base font-semibold text-foreground">Logs</h1>
    </div>
  )
}

function Toolbar({
  showRelativeTime,
  onToggleTimeDisplay,
}: {
  showRelativeTime: boolean
  onToggleTimeDisplay: () => void
}) {
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

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-border bg-white p-0.5">
          <button
            onClick={() => showRelativeTime && onToggleTimeDisplay()}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium transition-colors",
              !showRelativeTime
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <CalendarDays className="size-3" />
            <span>Absolute</span>
          </button>
          <button
            onClick={() => !showRelativeTime && onToggleTimeDisplay()}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium transition-colors",
              showRelativeTime
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Clock className="size-3" />
            <span>Relative</span>
          </button>
        </div>

        <Divider />

        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground">
            Hide Background Logs
          </span>
          <Toggle enabled={true} />
        </div>
      </div>
    </div>
  )
}

function FilterChipPill({
  icon,
  label,
  onClear,
}: {
  icon: React.ReactNode
  label: string
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/5 py-1 pl-2.5 pr-1.5 text-[12px]">
      <span className="text-success-foreground">{icon}</span>
      <span className="font-medium text-success-foreground">{label}</span>
      <button
        onClick={onClear}
        className="ml-0.5 flex size-4 items-center justify-center rounded-full transition-colors hover:bg-success/20"
      >
        <X className="size-2.5 text-success-foreground" />
      </button>
    </div>
  )
}

function TopAccountsTable({
  accounts,
  selectedAccount,
  onAccountClick,
}: {
  accounts: TopAccountEntry[]
  selectedAccount: string | null
  onAccountClick: (org: string) => void
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-[#f8f8f8]">
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-sm font-semibold text-foreground">
          Top Accounts
        </span>
        <span className="text-[11px] text-muted-foreground">
          {accounts.reduce((s, a) => s + a.count, 0)} total
        </span>
      </div>
      <div className="mx-3 mb-3 flex-1 overflow-hidden rounded-lg bg-white">
        <div className="flex items-center border-b border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          <span className="w-5 shrink-0">#</span>
          <span className="min-w-0 flex-1 pl-2">Account</span>
          <span className="w-[72px] shrink-0 text-right">Requests</span>
          <span className="w-[72px] shrink-0 text-right">Avg Time</span>
        </div>

        {accounts.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-[12px] text-muted-foreground">
            No data
          </div>
        ) : (
          accounts.map((acc, i) => {
            const isActive = selectedAccount === acc.organization
            return (
              <div
                key={acc.organization}
                role="button"
                tabIndex={0}
                aria-label={`${acc.organization} – ${acc.count} requests`}
                onClick={() => onAccountClick(acc.organization)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onAccountClick(acc.organization)
                  }
                }}
                className={cn(
                  "flex cursor-pointer items-center border-b border-border px-4 py-2.5 text-[13px] transition-colors last:border-b-0 hover:bg-muted/20",
                  isActive && "bg-success/5",
                )}
              >
                <span className="w-5 shrink-0 text-[11px] tabular-nums text-muted-foreground/50">
                  {i + 1}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-2 pl-2">
                  <ProviderIcon type={acc.providerIcon} />
                  <span
                    className={cn(
                      "truncate",
                      isActive
                        ? "font-medium text-success-foreground"
                        : "text-foreground",
                    )}
                  >
                    {acc.organization}
                  </span>
                </div>
                <span className="w-[72px] shrink-0 text-right tabular-nums font-medium text-foreground">
                  {acc.count}
                </span>
                <span className="w-[72px] shrink-0 text-right tabular-nums text-muted-foreground">
                  {acc.avgDuration} ms
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

function LogsTable({
  logs,
  selectedIndex,
  onRowClick,
  showRelativeTime,
  timeSortDirection,
  onTimeSort,
  methodFilters,
  onToggleMethodFilter,
  statusFilter,
  onStatusFilter,
}: {
  logs: LogEntry[]
  selectedIndex: number | null
  onRowClick: (index: number) => void
  showRelativeTime: boolean
  timeSortDirection: "asc" | "desc"
  onTimeSort: () => void
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
            sortDirection={timeSortDirection}
            onSort={onTimeSort}
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
                  selectedIndex === i && "bg-success/5",
                )}
              >
                {/* Time */}
                <div className="w-[150px] shrink-0 px-4 py-2.5">
                  <Tooltip
                    content={
                      showRelativeTime
                        ? `${log.date} | ${log.time}`
                        : formatRelativeTime(log)
                    }
                    side="bottom"
                  >
                    <span className="whitespace-nowrap text-muted-foreground">
                      {showRelativeTime ? (
                        formatRelativeTime(log)
                      ) : (
                        <>
                          {log.date}
                          <span className="mx-1.5 text-muted-foreground/30">
                            |
                          </span>
                          {log.time}
                        </>
                      )}
                    </span>
                  </Tooltip>
                </div>

                {/* Account – tooltip reveals provider + version */}
                <div className="w-[190px] shrink-0 px-4 py-2.5">
                  <Tooltip
                    content={
                      <span>
                        {log.provider}{" "}
                        <span className="text-white/50">
                          {log.providerVersion}
                        </span>
                      </span>
                    }
                    side="bottom"
                  >
                    <div className="flex items-center gap-2">
                      <ProviderIcon type={log.providerIcon} />
                      <span className="truncate text-muted-foreground">
                        {log.organization}
                      </span>
                    </div>
                  </Tooltip>
                </div>

                {/* Source */}
                <div className="w-[140px] shrink-0 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <SourceIcon />
                    <span className="truncate text-muted-foreground">
                      {log.source}
                    </span>
                  </div>
                </div>

                {/* Request – tooltip shows full path */}
                <div className="min-w-0 flex-1 px-4 py-2.5">
                  <Tooltip
                    content={`${log.method} ${log.path}`}
                    side="bottom"
                    align="start"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MethodBadge method={log.method} />
                      <span className="shrink-0 text-muted-foreground">
                        {log.resource}
                      </span>
                      <span className="truncate text-muted-foreground/50">
                        {log.path}
                      </span>
                    </div>
                  </Tooltip>
                </div>

                <div className="w-[32px] shrink-0" />

                {/* Duration */}
                <div className="w-[90px] shrink-0 px-4 py-2.5">
                  <span className="text-muted-foreground">{log.duration}</span>
                </div>

                {/* Status – tooltip shows human-readable status */}
                <div className="w-[80px] shrink-0 px-4 py-2.5">
                  <Tooltip
                    content={STATUS_TEXT[log.status] || `HTTP ${log.status}`}
                    side="bottom"
                  >
                    <StatusBadge code={log.status} />
                  </Tooltip>
                </div>

                {/* Actions */}
                <div className="flex w-[90px] shrink-0 items-center justify-end gap-2 px-3 py-2.5">
                  <Tooltip
                    content={
                      log.count === 0
                        ? "No sub-requests"
                        : `${log.count} related sub-requests`
                    }
                    side="bottom"
                    align="end"
                  >
                    <span className="text-[12px] text-muted-foreground/60">
                      {log.count}
                    </span>
                  </Tooltip>
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

// ---------------------------------------------------------------------------
// Table headers
// ---------------------------------------------------------------------------

function TimeColumnHeader({
  className,
  sortDirection,
  onSort,
}: {
  className?: string
  sortDirection: "asc" | "desc"
  onSort: () => void
}) {
  return (
    <div className={cn("shrink-0 px-4", className)}>
      <button
        onClick={onSort}
        className="flex items-center gap-1.5 transition-colors hover:text-foreground"
      >
        <span>Requested</span>
        {sortDirection === "asc" ? (
          <ChevronUp className="size-3 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-3 text-muted-foreground" />
        )}
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
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false)
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
                  methods.forEach((m) => {
                    if (methodFilters.has(m)) onToggle(m)
                  })
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
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false)
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
              onClick={() => {
                onFilter(opt.value)
                setOpen(false)
              }}
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

// ---------------------------------------------------------------------------
// Shared visual components
// ---------------------------------------------------------------------------

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
        colors[method],
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
          : "bg-[#ef3737]/10 text-[#ef3737]",
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
        colors[type] ?? "bg-muted",
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

function ToolbarButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted">
      {children}
    </button>
  )
}

function Toggle({
  enabled,
  onClick,
}: {
  enabled: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-[18px] w-[32px] items-center rounded-full p-[2px] transition-colors",
        enabled ? "justify-end bg-success" : "bg-[#e8e8e8]",
      )}
    >
      <div className="size-[14px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,35,11,0.2)]" />
    </button>
  )
}

function Divider() {
  return <div className="h-4 w-px shrink-0 bg-border" />
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
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex items-center justify-center gap-4 py-2 text-[13px] text-muted-foreground">
      <span>Total {total} Items</span>

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
                : "border-border hover:bg-muted",
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
