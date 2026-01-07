import { LoadingCenter } from "@/components/share/loading-center";
import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Reports",
};
export default function ReportsPage() {
    const DynamicReports = dynamic(() => import("@/components/dashboard/reports/Reports"), {
        loading: () => <LoadingCenter />,
    });
    return <DynamicReports />;
}