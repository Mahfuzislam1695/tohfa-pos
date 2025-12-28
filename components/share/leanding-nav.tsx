"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingNav() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">POSMaster</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <Link href="#features" className="hover:text-primary transition-colors">
                        Features
                    </Link>
                    <Link href="#analytics" className="hover:text-primary transition-colors">
                        Analytics
                    </Link>
                    <Link href="#pricing" className="hover:text-primary transition-colors">
                        Pricing
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" size="sm">
                            Log in
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
