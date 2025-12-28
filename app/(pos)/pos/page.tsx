import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | POS",
};
export default function POSPage() {
    const DynamicPOS = dynamic(() => import("@/components/pos/pos/Pos"), {
        loading: () => <Loader className="animate-spin" />,
    });
    return <DynamicPOS />;
}