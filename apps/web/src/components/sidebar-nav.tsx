import { cn } from "@workspace/ui/lib/utils"
import {
  LayoutDashboard,
  Users,
  List,
  Link,
  ShieldCheck as AuthIcon,
  KeyRound,
  Webhook,
  Settings,
  ExternalLink,
  ChevronDown,
  PanelLeftClose,
  Search,
  Play,
} from "lucide-react"

interface NavItem {
  label: string
  icon: React.ReactNode
  active?: boolean
  external?: boolean
}

const navItems: NavItem[] = [
  { label: "Connection", icon: <Link className="size-4" /> },
  { label: "Auth Configs", icon: <AuthIcon className="size-4" /> },
  { label: "Accounts", icon: <Users className="size-4" /> },
  { label: "Playground", icon: <Play className="size-4" /> },
  { label: "API Keys", icon: <KeyRound className="size-4" /> },
  { label: "Webhooks", icon: <Webhook className="size-4" /> },
  { label: "Logs", icon: <List className="size-4" />, active: true },
  { label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { label: "Project Settings", icon: <Settings className="size-4" /> },
]

const supportItems: NavItem[] = [
  {
    label: "Documentation",
    icon: <ExternalLink className="size-4" />,
    external: true,
  },
]

export function SidebarNav() {
  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-border bg-[#fafafa]">
      <div className="flex h-[60px] items-center gap-3 border-b border-border px-7">
        <div className="flex flex-1 items-center gap-3">
          <StackOneLogo />
          <span className="flex-1 truncate text-sm font-medium text-foreground">
            Example Project [EU-E...
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </div>
        <PanelLeftClose className="size-4 text-muted-foreground" />
      </div>

      <div className="px-5 pt-3 pb-1">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-2.5 py-1.5">
          <Search className="size-3.5 text-muted-foreground" />
          <span className="flex-1 text-xs text-muted-foreground">Search</span>
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
            Ctrl
          </kbd>
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
            K
          </kbd>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-y-auto">
        <nav className="flex flex-col gap-0.5 px-5 py-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "flex h-[34px] w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                item.active
                  ? "bg-success/10 text-success-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-col">
          <div className="flex flex-col gap-0.5 px-5 py-4">
            <p className="px-3 pt-2 pb-1 text-xs font-semibold text-[#bbb]">
              Support
            </p>
            {supportItems.map((item) => (
              <button
                key={item.label}
                className="flex h-[34px] w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
                {item.external && (
                  <ExternalLink className="size-[11px] text-[#bbb]" />
                )}
              </button>
            ))}
          </div>

          <div className="flex h-[60px] items-center border-t border-border px-5">
            <div className="flex w-full items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex size-4 items-center justify-center rounded border border-border text-xs font-medium">
                C
              </div>
              <span className="flex-1 truncate text-sm font-medium text-foreground">
                Candidate-Tes...
              </span>
              <Settings className="size-[13px] text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function StackOneLogo() {
  return (
    <svg
      width="24"
      height="14"
      viewBox="0 0 24 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="7" height="5" fill="#00AF66" />
      <rect x="8.5" width="7" height="5" fill="#00AF66" />
      <rect y="4.5" width="7" height="5" fill="#00AF66" />
      <rect x="8.5" y="4.5" width="7" height="5" fill="#00AF66" />
      <rect y="9" width="7" height="5" fill="#00AF66" />
      <rect x="8.5" y="9" width="7" height="5" fill="#00AF66" />
      <rect x="17" y="9" width="7" height="5" fill="#00AF66" />
    </svg>
  )
}
