import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Products",
};
export default function ProductsPage() {
    const DynamicProducts = dynamic(() => import("@/components/dashboard/products/Products"), {
        loading: () => <Loader className="animate-spin" />,
    });
    return <DynamicProducts />;
}