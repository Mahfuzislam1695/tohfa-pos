import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Dashboard",
};
export default function DashboardPage() {
    const DynamicDashboard = dynamic(() => import("@/components/dashboard/dashboard/Dashboard"), {
        loading: () => <div className=""><Loader className="animate-spin" /></div>,
    });
    return <DynamicDashboard />;
}