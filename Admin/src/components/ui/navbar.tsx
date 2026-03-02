import { Menu, User, LogOut } from "lucide-react"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"

interface NavbarProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

export function Navbar({ onMenuClick, isMobile }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 h-16 border-b bg-background">
      <div className="flex h-full items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="hover:bg-accent"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <span className="font-semibold text-lg">Story Dashboard</span>
        </div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
