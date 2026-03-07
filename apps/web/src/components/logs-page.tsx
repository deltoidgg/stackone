import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  Search,
  RefreshCw,
  BookOpen,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  ChevronRight,
} from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
type StatusCode = number

interface LogEntry {
  date: string
  time: string
  account: string
  accountIcon: string
  source: string
  sourceIcon: "connection" | "identifier" | "key" | "token" | "mapping"
  method: HttpMethod
  resource: string
  path: string
  duration: number
  status: StatusCode
  retries: number
}

const SAMPLE_LOGS: LogEntry[] = [
  { date: "Aug 13", time: "21:05:19.123", account: "Sample Organization", accountIcon: "bamboo", source: "Test Connection", sourceIcon: "connection", method: "GET", resource: "List Employees", path: "/employees.applic...", duration: 583, status: 200, retries: 0 },
  { date: "Aug 12", time: "21:05:19.123", account: "Sample Organization", accountIcon: "greenhouse", source: "Identifier 1", sourceIcon: "identifier", method: "POST", resource: "List Employees", path: "/unified/ats/appl...", duration: 224, status: 200, retries: 2 },
  { date: "Aug 09", time: "21:05:19.123", account: "Sample Organization", accountIcon: "zelt", source: "Key", sourceIcon: "key", method: "GET", resource: "List Employees", path: "/unified/ats/appl...", duration: 247, status: 200, retries: 3 },
  { date: "Aug 08", time: "21:05:19.123", account: "Sample Organization", accountIcon: "zelt", source: "Identifier 1", sourceIcon: "identifier", method: "POST", resource: "List Employees", path: "/unified/ats/appl...", duration: 205, status: 401, retries: 3 },
  { date: "Aug 06", time: "21:05:19.123", account: "Sample Organization", accountIcon: "bullhorn", source: "Refresh Token", sourceIcon: "token", method: "GET", resource: "List Employees", path: "/unified/ats/appl...", duration: 154, status: 200, retries: 2 },
  { date: "Aug 13", time: "21:05:19.123", account: "Sample Organization", accountIcon: "bamboo", source: "Test Connection", sourceIcon: "connection", method: "GET", resource: "List Employees", path: "/unified/ats/appl...", duration: 583, status: 200, retries: 0 },
  { date: "Aug 12", time: "21:05:19.123", account: "Sample Organization", accountIcon: "greenhouse", source: "Identifier 1", sourceIcon: "identifier", method: "POST", resource: "List Employees", path: "/unified/ats/appl...", duration: 224, status: 200, retries: 5 },
  { date: "Aug 09", time: "21:05:19.123", account: "Sample Organization", accountIcon: "zelt", source: "Test Mapping", sourceIcon: "mapping", method: "GET", resource: "List Employees", path: "/unified/ats/appl...", duration: 247, status: 200, retries: 3 },
  { date: "Aug 06", time: "21:05:19.123", account: "Sample Organization", accountIcon: "bullhorn", source: "Refresh Token", sourceIcon: "token", method: "GET", resource: "List Employees", path: "/unified/ats/appl...", duration: 154, status: 200, retries: 2 },
  { date: "Aug 13", time: "21:05:19.123", account: "Sample Organization", accountIcon: "bamboo", source: "Test Connection", sourceIcon: "connection", method: "GET", resource: "List Employees", path: "/unified/ats/appl...", duration: 583, status: 200, retries: 0 },
  { date: "Aug 12", time: "21:05:19.123", account: "Sample Organization", accountIcon: "greenhouse", source: "Identifier 1", sourceIcon: "identifier", method: "POST", resource: "List Employees", path: "/unified/ats/appl...", duration: 224, status: 200, retries: 5 },
  { date: "Aug 09", time: "21:05:19.123", account: "Sample Organization", accountIcon: "zelt", source: "Test Mapping", sourceIcon: "mapping", method: "GET", resource: "List Employees", path: "/unified/ats/appl...", duration: 247, status: 200, retries: 3 },
  { date: "Aug 08", time: "21:05:19.123", account: "Sample Organization", accountIcon: "bullhorn", source: "Identifier 1", sourceIcon: "identifier", method: "POST", resource: "List Employees", path: "/unified/ats/appl...", duration: 205, status: 401, retries: 0 },
  { date: "Aug 06", time: "21:05:19.123", account: "Sample Organization", accountIcon: "greenhouse", source: "Test Connection", sourceIcon: "connection", method: "GET", resource: "List Employees", path: "/unified/ats/appl...", duration: 154, status: 200, retries: 3 },
]

const CHART_DATA = [
  28, 36, 29, 23, 34, 37, 39, 41, 55, 31, 23, 47, 58, 52, 53, 45, 28, 28,
  36, 29, 23, 34, 37, 39, 41, 55, 31, 23, 47, 58, 52, 53, 45, 28, 28, 36,
  29, 23, 34, 37, 39, 41, 55, 31, 23, 47, 58, 52, 45, 45, 28, 37, 39, 41,
  55, 31, 23, 47, 58, 52, 53, 45, 28, 36, 29, 23, 34, 37, 39, 41, 55, 31,
  23, 47, 58, 52, 29, 36, 29, 23, 34, 37, 39, 41, 55, 31, 23, 47, 58, 52,
]

const ERROR_DATA = [
  3, 6, 6, 3, 7, 6, 7, 6, 10, 6, 3, 7, 8, 7, 6, 6, 3, 3,
  6, 6, 3, 7, 6, 7, 6, 10, 6, 3, 7, 8, 7, 6, 6, 3, 3, 6,
  6, 3, 7, 6, 7, 6, 10, 6, 3, 7, 8, 7, 6, 6, 3, 6, 7, 6,
  10, 6, 3, 7, 8, 7, 6, 6, 3, 6, 6, 3, 7, 6, 7, 6, 10, 6,
  3, 7, 8, 7, 6, 6, 6, 3, 7, 6, 7, 6, 10, 6, 3, 7, 8, 7,
]

const TIME_LABELS = ["15:10", "15:11", "15:12", "15:13", "15:14", "15:15", "15:16", "15:17", "15:18"]

export function LogsPage() {
  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto px-7 pb-7">
          <div className="flex flex-col gap-7">
            <Toolbar />
            <ChartSection />
            <LogsTable logs={SAMPLE_LOGS} />
          </div>
        </main>
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="flex h-[60px] shrink-0 items-center justify-between px-7 pt-2">
      <h1 className="text-base font-semibold text-foreground">Request Logs</h1>
      <Button variant="outline" size="sm" className="gap-1.5">
        <BookOpen className="size-3.5" />
        Docs
      </Button>
    </div>
  )
}

function Toolbar() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-border bg-white px-2.5 py-1.5 shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
        <Search className="size-[15px] text-[#bbb]" />
        <span className="text-[13px] text-[#bbb]">Search / Filter</span>
      </div>

      <Divider />

      <ToolbarButton>10 Jul 2024 - 23 Jul 2024</ToolbarButton>

      <Divider />

      <ToolbarButton>
        Background Logs
        <Toggle enabled={false} />
      </ToolbarButton>

      <ToolbarButton>
        Full Width
        <Toggle enabled={false} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton>
        <RefreshCw className="size-[13px]" />
        Refresh
      </ToolbarButton>
    </div>
  )
}

function ToolbarButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-white px-2.5 py-1.5 text-[13px] font-medium text-foreground shadow-[0_1px_0_rgba(0,0,0,0.15)] transition-colors hover:bg-muted">
      {children}
    </button>
  )
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <div
      className={cn(
        "flex h-3 w-5 items-center rounded-full p-0.5 transition-colors",
        enabled ? "justify-end bg-success" : "bg-[#e8e8e8]"
      )}
    >
      <div className="size-2 rounded-full bg-white shadow-[0_2px_4px_rgba(0,35,11,0.2)]" />
    </div>
  )
}

function Divider() {
  return <div className="h-4 w-px shrink-0 bg-[#e8e8e8]" />
}

function ChartSection() {
  const maxVal = Math.max(...CHART_DATA)

  return (
    <div className="rounded-xl border border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-foreground">
          API Requests
        </span>
        <div className="flex shrink-0 items-center gap-4">
          <StatItem
            color="bg-[#0a0a0a]"
            label="Total"
            value="580,000"
            trend={<TrendBadge value="0%" direction="neutral" />}
          />
          <StatItem
            color="bg-success"
            label="Success"
            value="580,000"
            trend={<TrendBadge value="2%" direction="up" />}
          />
          <StatItem
            color="bg-[#ef3737]"
            label="Error"
            value="20,000"
            trend={<TrendBadge value="2%" direction="down" />}
          />
        </div>
      </div>

      <div className="px-4 pb-4 pt-2">
        <div className="flex gap-3">
          <div className="flex w-5 flex-col justify-between text-[11px] text-muted-foreground">
            <span>2k</span>
            <span>1k</span>
            <span>0k</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex h-[180px] items-end gap-px">
              {CHART_DATA.map((val, i) => {
                const totalHeight = (val / maxVal) * 100
                const errVal = ERROR_DATA[i] ?? 0
                const errorHeight = (errVal / maxVal) * 100
                const successHeight = totalHeight - errorHeight

                return (
                  <div
                    key={i}
                    className="flex min-w-0 flex-1 flex-col justify-end"
                    style={{ height: "100%" }}
                  >
                    <div
                      className="w-full rounded-t-[1px] bg-[#ef3737]/40"
                      style={{ height: `${errorHeight}%` }}
                    />
                    <div
                      className="w-full bg-success/40"
                      style={{ height: `${successHeight}%` }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              {TIME_LABELS.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatItem({
  color,
  label,
  value,
  trend,
}: {
  color: string
  label: string
  value: string
  trend: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("size-2 rounded-full", color)} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">|</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
      {trend}
    </div>
  )
}

function TrendBadge({
  value,
  direction,
}: {
  value: string
  direction: "up" | "down" | "neutral"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        direction === "up" && "bg-success/10 text-success-foreground",
        direction === "down" && "bg-[#ef3737]/10 text-[#ef3737]",
        direction === "neutral" && "bg-muted text-muted-foreground"
      )}
    >
      {direction === "up" && <ArrowUp className="size-2.5" />}
      {direction === "down" && <ArrowDown className="size-2.5" />}
      {direction === "neutral" && <Minus className="size-2.5" />}
      {value}
    </span>
  )
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  connection: <ConnectionIcon />,
  identifier: <IdentifierIcon />,
  key: <KeyIcon />,
  token: <TokenIcon />,
  mapping: <MappingIcon />,
}

function LogsTable({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <SortableHeader className="w-[170px]">Requested</SortableHeader>
            <SortableHeader className="w-[190px]">Account</SortableHeader>
            <SortableHeader className="w-[165px]">Source</SortableHeader>
            <th className="px-4 py-3 font-semibold text-foreground">
              <div className="flex items-center justify-between">
                <span>Request</span>
                <div className="flex items-center gap-5">
                  <Plus className="size-[13px] text-muted-foreground" />
                  <ChevronDown className="size-3 text-muted-foreground" />
                </div>
              </div>
            </th>
            <SortableHeader className="w-[110px]">Duration</SortableHeader>
            <SortableHeader className="w-[95px]">Status</SortableHeader>
            <th className="w-[115px] px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr
              key={i}
              className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/30"
            >
              <td className="px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {log.date}
                  <span className="mx-1.5 text-muted-foreground/50">|</span>
                  {log.time}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <AccountBadge type={log.accountIcon} />
                  <span className="text-sm text-muted-foreground">
                    {log.account}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-5 items-center justify-center rounded-md border border-border">
                    {SOURCE_ICONS[log.sourceIcon]}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {log.source}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <MethodBadge method={log.method} />
                  <span className="text-sm text-muted-foreground">
                    {log.resource}
                  </span>
                  <span className="text-sm text-muted-foreground/50">|</span>
                  <span className="text-sm text-muted-foreground truncate">
                    {log.path}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm font-medium text-foreground">
                  {log.duration}
                </span>
                <span className="ml-1 text-sm text-muted-foreground">ms</span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge code={log.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <RetryBadge count={log.retries} />
                  <ExpandButton />
                  <ChevronRight className="size-3 text-muted-foreground" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SortableHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 font-semibold text-foreground",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span>{children}</span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </div>
    </th>
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
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
        colors[method]
      )}
    >
      {method}
    </span>
  )
}

function StatusBadge({ code }: { code: StatusCode }) {
  const isError = code >= 400

  return (
    <span
      className={cn(
        "text-sm font-medium",
        isError ? "text-[#ef3737]" : "text-success-foreground"
      )}
    >
      {code}
    </span>
  )
}

function RetryBadge({ count }: { count: number }) {
  return (
    <div className="flex size-4 items-center justify-center rounded border border-border text-[10px] font-medium text-muted-foreground">
      {count}
    </div>
  )
}

function ExpandButton() {
  return (
    <button className="flex size-5 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted">
      <Minus className="size-2.5 text-muted-foreground" />
    </button>
  )
}

function AccountBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    bamboo: "bg-[#73c41d]",
    greenhouse: "bg-[#3b8427]",
    zelt: "bg-[#6366f1]",
    bullhorn: "bg-[#ef4444]",
  }

  return (
    <div
      className={cn(
        "size-[18px] rounded-sm",
        colors[type] ?? "bg-muted"
      )}
    />
  )
}

function ConnectionIcon() {
  return (
    <div className="size-[13px] rounded-sm border border-[#e8e8e8] bg-white" />
  )
}

function IdentifierIcon() {
  return (
    <div className="size-[13px] rounded-sm border border-[#e8e8e8] bg-[#f5f5f5]" />
  )
}

function KeyIcon() {
  return (
    <div className="size-[13px] rounded-sm border border-dashed border-[#bbb] bg-white" />
  )
}

function TokenIcon() {
  return (
    <div className="size-[13px] rounded-full border border-[#e8e8e8] bg-white" />
  )
}

function MappingIcon() {
  return (
    <div className="size-[13px] rounded-sm border border-[#e8e8e8] bg-[#fafafa]" />
  )
}
