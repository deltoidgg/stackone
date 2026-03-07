import { cn } from "@workspace/ui/lib/utils"
import {
  LayoutDashboard,
  Users,
  List,
  GitBranch,
  Puzzle,
  KeyRound,
  Webhook,
  Settings,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  PanelLeftClose,
} from "lucide-react"

interface NavItem {
  label: string
  icon: React.ReactNode
  active?: boolean
  external?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Overview", icon: <LayoutDashboard className="size-4" /> },
      { label: "Accounts", icon: <Users className="size-4" /> },
      { label: "Logs", icon: <List className="size-4" />, active: true },
    ],
  },
  {
    title: "Configuration",
    items: [
      { label: "Field Mapping", icon: <GitBranch className="size-4" /> },
      { label: "Integrations", icon: <Puzzle className="size-4" /> },
      { label: "API Keys", icon: <KeyRound className="size-4" /> },
      { label: "Webhooks", icon: <Webhook className="size-4" /> },
      { label: "Project Settings", icon: <Settings className="size-4" /> },
    ],
  },
]

const supportItems: NavItem[] = [
  { label: "Field Coverage", icon: <ShieldCheck className="size-4" /> },
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
            Production [EU1]
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </div>
        <PanelLeftClose className="size-4 text-muted-foreground" />
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-y-auto">
        <nav className="flex flex-col gap-1 px-5 py-2">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <p className="px-3 pt-3.5 pb-1 text-xs font-semibold text-[#bbb]">
                {section.title}
              </p>
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className={cn(
                    "flex h-[37px] w-full items-center gap-4 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    item.active
                      ? "bg-success/10 text-success-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="flex flex-col">
          <div className="flex flex-col gap-1 px-5 py-4">
            <p className="px-3 pt-3.5 pb-1 text-xs font-semibold text-[#bbb]">
              Support
            </p>
            {supportItems.map((item) => (
              <button
                key={item.label}
                className="flex h-[37px] w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="flex items-center gap-4">
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
            <div className="flex w-full items-center gap-4 rounded-xl px-3 py-2.5">
              <div className="flex size-4 items-center justify-center rounded border border-border text-xs font-medium">
                M
              </div>
              <span className="flex-1 truncate text-sm font-medium text-foreground">
                Morgan Williams
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
