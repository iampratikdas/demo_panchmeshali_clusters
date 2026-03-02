import { Button } from "@/components/ui/button"
import {
  // Search,
  // Bell,
  ChevronDown,
  Menu,
} from "lucide-react"
// import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from "react-router";

// import { ThemeToggle } from "@/components/theme-toggle"

interface NavbarProps {
  onMenuClick: () => void,
  isMobile: boolean
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const handleSignOut =()=>{
    localStorage.clear();
    navigate("/signin")
  }
   if(!localStorage.getItem("token")){
    localStorage.clear();
    window.location.href ="/signin";
    return <>Loading.......</>
  }
  // console.log("checkname==============>", (localStorage.getItem("full_name") || "").split(' ').map(w => w[0].toUpperCase()).join(''))
  return (
    <div className="flex h-14 min-h-[3.5rem] border-b items-center px-4 gap-4  text-black sticky top-0 z-30" >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-black hover:text-black/80"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      {/* <div className="flex items-center gap-2 flex-1">
        <Search className="h-4 w-4 text-white/70" />
        <Input
          type="search"
          placeholder="Enter keyword..."
          className="w-[300px] bg-white/10 text-white placeholder:text-white/50 border-0"
        />
      </div> */}
      <div className="ml-auto flex items-center gap-2">
        {/* <ThemeToggle /> */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:text-white/80"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
            // #062165
            style={{background:"rgb(6 33 101 / 13%)"}}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src="/avatar.jpg" alt="User" />
                <AvatarFallback>{(localStorage.getItem("full_name") || "").split(' ').map(w => w[0].toUpperCase()).join('')}</AvatarFallback>
              </Avatar>
              <span>{localStorage.getItem("full_name") || "User"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={()=> navigate("/")}>Home</DropdownMenuItem>
            <DropdownMenuItem onClick={()=> navigate("/profile")}>Profile</DropdownMenuItem>
            {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
            <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
