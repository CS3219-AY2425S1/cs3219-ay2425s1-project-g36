import { Button } from "@/components/ui/button"
import { Code } from "lucide-react"
import { Link } from "react-router-dom"
import PageAccountNav from "./PageAccountNav"

/**
 * Represents the header shared across all pages in PeerPrep.
 */
export default function PageHeader({isLoggedIn = true} : {isLoggedIn? : boolean}) {
  const linkClassName = "text-sm no-underline font-medium text-muted-foreground transition-colors hover:text-gray-700";

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
      <Button variant="ghost" id="peerprep-header" className="flex no-underline text-primary items-center gap-2 text-lg font-semibold hover:text-gray-700" asChild>
        <Link to="/">
          <Code className="h-6 w-6" />
          <span className="no-underline text-primary !important visited:text-primary hover:text-gray-700">
            PeerPrep
          </span>
        </Link>
      </Button>
      
      {isLoggedIn && (
        <>
          <nav className="flex items-center space-x-4">
            <Link
              to="/questions"
              className={linkClassName}
            >
              Questions
            </Link>
            <div className="h-4 w-px bg-black/20" aria-hidden="true" />
            <Link
              to="/matching/start"
              className={linkClassName}
            >
              Practise an Interview
            </Link>
            <div className="h-4 w-px bg-black/20" aria-hidden="true" />
            <Link 
              to="/history"
              className={linkClassName}
            >
              History
            </Link>
          </nav>
          <PageAccountNav />
        </>
      )
      }
    </header>
  )
}