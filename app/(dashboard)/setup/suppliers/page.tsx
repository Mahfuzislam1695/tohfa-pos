import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Setup-Suppliers",
};
export default function SuppliersSetupPage() {
    const DynamicSuppliersSetup = dynamic(() => import("@/components/dashboard/setup/suppliers/Suppliers"), {
        loading: () => <Loader className="animate-spin" />,
    });
    return <DynamicSuppliersSetup />
}