import { DashboardHeader } from "@/components/share/dashboard-header";
import { DashboardSidebar } from "@/components/share/dashboard-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto bg-background">
                    <div className="min-h-full flex flex-col">                    {children}
                    </div>
                </main>
            </div>
        </div>
    );
}