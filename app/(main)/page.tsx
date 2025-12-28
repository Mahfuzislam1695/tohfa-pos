import Link from "next/link"
import { ArrowRight, BarChart3, Box, LayoutDashboard, Users, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingNav } from "@/components/share/leanding-nav"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
            <LandingNav />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        New: Full Inventory Conversion Tracking
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        The intelligent way to manage your <span className="text-primary italic">retail business</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        Manage sales, inventory, and staff from one centralized dashboard. Built for speed, accuracy, and growth.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <Link href="/login">
                            <Button
                                size="lg"
                                className="h-12 px-8 text-base gap-2 bg-primary hover:bg-primary/90 group shadow-lg shadow-primary/20"
                            >
                                Start Managing for Free
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent">
                            Watch Demo
                        </Button>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section id="features" className="py-24 bg-accent/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Everything you need to scale</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Stop fighting with spreadsheets. Our comprehensive toolkit handles the heavy lifting.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <div className="md:col-span-2 row-span-2 group relative overflow-hidden rounded-3xl bg-background border border-border/50 p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all">
                            <div className="flex flex-col h-full">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                    <LayoutDashboard className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Advanced POS Terminal</h3>
                                <p className="text-muted-foreground mb-8 text-balance">
                                    A lightning-fast interface with full-screen support, category filtering, and smart unit conversion for
                                    complex sales.
                                </p>
                                <div className="mt-auto relative rounded-xl overflow-hidden border border-border/50 bg-muted/50 aspect-video flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                                    <BarChart3 className="h-20 w-20 text-primary/10" />
                                </div>
                            </div>
                        </div>

                        <div className="group rounded-3xl bg-background border border-border/50 p-8 hover:shadow-xl transition-all">
                            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                                <Box className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Inventory Intelligence</h3>
                            <p className="text-sm text-muted-foreground">
                                Track stock levels in real-time. Automatic low-stock alerts and smart unit conversions.
                            </p>
                        </div>

                        <div className="group rounded-3xl bg-background border border-border/50 p-8 hover:shadow-xl transition-all">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Staff Management</h3>
                            <p className="text-sm text-muted-foreground">
                                Role-based access control for Admins, Managers, and Sales staff with activity logs.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border/40 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                                <ShoppingCart className="h-3 w-3 text-primary-foreground" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">POSMaster</span>
                        </div>
                        <p className="text-sm text-muted-foreground">© 2025 POSMaster. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

