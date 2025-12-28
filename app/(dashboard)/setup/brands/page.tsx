import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Setup-Brand",
};
export default function BrandSetupPage() {
    const DynamicBrandSetup = dynamic(() => import("@/components/dashboard/setup/brand/Brand"), {
        loading: () => <Loader className="animate-spin" />,
    });
    return <DynamicBrandSetup />
}