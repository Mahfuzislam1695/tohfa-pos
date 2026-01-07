"use client"

import { Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"

interface FullscreenButtonProps {
    isFullscreen: boolean
    toggleFullscreen: () => void
}

export function FullscreenButton({ isFullscreen, toggleFullscreen }: FullscreenButtonProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return createPortal(
        <div className="fixed top-4 right-4 z-50">
            <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="shadow-lg"
            >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
        </div>,
        document.body
    )
}