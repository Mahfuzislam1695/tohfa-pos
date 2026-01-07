import { LoadingCenter } from "@/components/share/loading-center";
import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Setup-Categories",
};
export default function CategoriesSetupPage() {
    const DynamicCategoriesSetup = dynamic(() => import("@/components/dashboard/setup/categories/Categories"), {
        loading: () => <LoadingCenter />,
    });
    return <DynamicCategoriesSetup />
}