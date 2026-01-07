import { Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
    isFullscreen: boolean
    toggleFullscreen: () => void
}

export function Header({ isFullscreen, toggleFullscreen }: HeaderProps) {
    return (
        <div className="border-b border-border bg-card px-6 py-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Point of Sale</h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </div>
                    <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}