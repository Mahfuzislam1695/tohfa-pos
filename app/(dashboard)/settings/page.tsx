import { LoadingCenter } from "@/components/share/loading-center";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Setting",
};
export default function SettingPage() {
    const DynamicSetting = dynamic(() => import("@/components/dashboard/settings/Settings"), {
        loading: () => <LoadingCenter />,
    });
    return <DynamicSetting />;
}