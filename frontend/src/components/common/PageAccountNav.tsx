import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { User } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "../ui/badge"

/**
 * Component for the navigation at the top right hand corner of the screen
 * that handles user interaction and logging out.
 */
export default function PageAccountNav() {

  const { auth, logout } = useAuth();

  return (
    <div className="z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white" align="end">
          <DropdownMenuLabel>
            <div>
              <div className="flex gap-2">
                <span>{ auth.username }</span>
                { auth.isAdmin ? <Badge>Admin</Badge> : <></> }
              </div>
              <p className="font-normal">{ auth.email }</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-200" />
          <DropdownMenuItem>
            <Link to="/settings">
              Account Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-200" />
          <DropdownMenuItem>
            <Link className="text-red-500 hover:text-red-400" onClick={logout} to="#">
              Log out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
