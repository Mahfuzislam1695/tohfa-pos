import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Product Removals",
};
export default function RemovalPage() {
    const DynamicRemoval = dynamic(() => import("@/components/dashboard/removal-products/removals"), {
        loading: () => <Loader className="animate-spin" />,
    });
    return <DynamicRemoval />;
}