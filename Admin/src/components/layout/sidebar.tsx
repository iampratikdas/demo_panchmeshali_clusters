import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Calendar,
  UserCog,
  LayoutGrid,
  Table,
  Layers,
  LucideIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { NavLink } from "react-router-dom"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

interface NavigationItem {
  title: string
  icon: LucideIcon
  href: string
  active?: boolean
  badge?: string
}

export function Sidebar({ className, isCollapsed, onCollapsedChange }: SidebarProps) {
  const navigation: NavigationItem[] = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      active: true,
    },
    {
      title: "Submit Content",
      icon: LayoutGrid,
      href: "/submit",
      active: true,
    },
    {
      title: "Content Status",
      icon: Table,
      href: "/status",
      active: true,
    },
    {
      title: "Users",
      icon: UserCog,
      href: "/users_list",
      active: localStorage.getItem("role") === "admin"  ? true : false,
    },
    {
      title: "Create Events",
      icon: Calendar,
      href: "/events",
      active: localStorage.getItem("role") === "admin" || localStorage.getItem("role") === "manager" ? true : false,
    },
    {
      title: "Work Flows",
      icon: Layers,
      href: "/work_flows",
      active: localStorage.getItem("role") === "admin" || localStorage.getItem("role") === "manager" ? true : false,
    },

  ]
  console.log("isCollapsed---------------->", localStorage.getItem("role") === "admin" || localStorage.getItem("role") === "manager" ? true : false)
  return (
    <div className="relative" >
      <div
        className={cn(
          "flex flex-col h-screen bg-[rgb(6,33,101)] text-white",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Fixed header */}
        <div className="flex h-14 min-h-[3.5rem] items-center border-b border-white/10 px-3">
          <span className={cn(
            "flex items-center gap-2 font-semibold",
            isCollapsed && "w-6 overflow-hidden"
          )}>
            {/* <span className="h-6 w-6 rounded-lg bg-primary" /> */}
            {!isCollapsed && <img className="h-10" src="logo.png" />}
            {!isCollapsed && <p className="h-10 relative  top-2">পাঁচমেশালী </p>}
          </span>
        </div>

        {/* Scrollable navigation */}
        <ScrollArea className="flex-1" style={{ boxShadow: 'rgba(0, 0, 0, 0.35) 0px 15px 15px' }}>
          <div className="flex flex-col gap-2 px-2 py-4 w-[90%]">
            {navigation.map((item) => {
              if (!item.active) return null; 
              return (
                          <NavLink
                            key={item.href}
                            to={item.href}
                            
                            onClick={() => {
                              if (window.innerWidth <= 768) {
                                onCollapsedChange?.(true);
                              }
                            }}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white transition-colors",
                                isActive && "bg-white/10 text-white"
                              )
                            }
                          >
                            <item.icon className="h-4 w-4" />
                            {!isCollapsed && (
                              <div className="flex flex-1 items-center justify-between">
                                <span>{item.title}</span>
                                {item.badge && (
                                  <span className={cn(
                                    "rounded-full px-2 py-0.5 text-xs",
                                    item.badge === "New" ? "bg-primary text-white" : "bg-white/10 text-gray-300"
                                  )}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            )}
                          </NavLink>
                        
                        )}
            )
          }
          </div>
        </ScrollArea>

        {/* Fixed footer */}
        {/* <div className="border-t border-white/10">
          <div className="p-4 flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <Settings className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">John Doe</span>
                <span className="text-xs text-gray-300">john@example.com</span>
              </div>
            )}
          </div>
        </div> */}
      </div>

      {/* Collapse button - hidden on mobile */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-[72px] h-6 w-6 rounded-full bg-[rgb(6,33,101)] text-white hover:bg-[rgb(6,33,101)]/90 shadow-md hidden md:flex"
        onClick={() => onCollapsedChange?.(!isCollapsed)}
        style={{ border: "solid white 1px", boxShadow: "0px 0px 0px 3px white" }}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </div>
  )
}
