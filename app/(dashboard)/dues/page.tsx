import { LoadingCenter } from "@/components/share/loading-center";
import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Dues",
};
export default function DuesPage() {
    const DynamicDues = dynamic(() => import("@/components/dashboard/dues/dues"), {
        loading: () => <LoadingCenter />,
    });
    return <DynamicDues />;
}