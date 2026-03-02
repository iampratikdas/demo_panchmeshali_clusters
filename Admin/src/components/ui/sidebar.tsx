import { Home, Send, Clock, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "./button"

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Send, label: "Submit Your Story", path: "/submit" },
  { icon: Clock, label: "Story Status", path: "/status" },
]

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onClose: () => void;
}

export function Sidebar({ isCollapsed, onToggle, isMobile, onClose }: SidebarProps) {
  const location = useLocation()
  console.log("isMobile---------------->", isMobile)
  return (
    <div 
      className={`
        bg-background h-full border-r relative transition-all duration-300 flex flex-col
        ${isCollapsed && !isMobile ? 'w-[70px]' : 'w-[280px]'}
      `}
    >
      {/* Mobile Header */}
      {isMobile && (
        <div className="border-b py-4 px-4 flex items-center justify-between bg-background">
          <span className="font-semibold text-lg">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Desktop Collapse Toggle */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-6 bg-primary hover:bg-primary/90 text-primary-foreground hover:text-primary-foreground border-none shadow-md rounded-full p-0.5 hidden md:flex items-center justify-center w-6 h-6"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </Button>
      )}

      {/* Menu Items */}
      <div className="flex-1 py-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={isMobile ? onClose : undefined}
            className={`
              flex items-center px-4 py-3 transition-colors gap-3
              hover:bg-accent/50 hover:text-accent-foreground
              ${location.pathname === item.path ? "bg-accent/50 text-primary font-medium" : "text-primary"}
            `}
          >
            <item.icon className={`h-5 w-5 shrink-0 ${location.pathname === item.path ? "text-primary" : "text-primary"}`} />
            {(!isCollapsed || isMobile) && (
              <span className="text-sm">{item.label}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
