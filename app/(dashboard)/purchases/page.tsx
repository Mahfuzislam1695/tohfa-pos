import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Purchases",
};
export default function PurchasesPage() {
    const DynamicPurchases = dynamic(() => import("@/components/dashboard/purchases/Purchases"), {
        loading: () => <Loader className="animate-spin" />,
    });
    return <DynamicPurchases />;
}