import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
            <Search className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-bold text-foreground">{"Page Not Found"}</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            {"Oops! The page you're looking for doesn't exist. It might have been moved or deleted."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button asChild size="lg" className="min-w-[160px]">
            <Link href="/dashboard">
              <Home className="mr-2 h-5 w-5" />
              {"Go to Dashboard"}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[160px] bg-transparent">
            <Link href="/">
              <ArrowLeft className="mr-2 h-5 w-5" />
              {"Go Back"}
            </Link>
          </Button>
        </div>

        <div className="pt-8 border-t border-border/50 mt-12">
          <p className="text-sm text-muted-foreground mb-4">{"Need help? Here are some useful links:"}</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/dashboard" className="text-primary hover:text-primary/80 transition-colors">
              {"Dashboard"}
            </Link>
            <span className="text-border">{"•"}</span>
            <Link href="#" className="text-primary hover:text-primary/80 transition-colors">
              {"Sales"}
            </Link>
            <span className="text-border">{"•"}</span>
            <Link href="#" className="text-primary hover:text-primary/80 transition-colors">
              {"Products"}
            </Link>
            <span className="text-border">{"•"}</span>
            <Link href="#" className="text-primary hover:text-primary/80 transition-colors">
              {"Support"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
