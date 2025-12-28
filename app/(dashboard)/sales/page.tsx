import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Sales",
};
export default function SalesPage() {
    const DynamicSales = dynamic(() => import("@/components/dashboard/sales/Sales"), {
        loading: () => <Loader className="animate-spin" />,
    });
    return <DynamicSales />;
}