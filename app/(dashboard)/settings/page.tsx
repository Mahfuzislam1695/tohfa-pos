import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Setting",
};
export default function SettingPage() {
    const DynamicSetting = dynamic(() => import("@/components/dashboard/settings/Settings"), {
        loading: () => <Loader className="animate-spin" />,
    });
    return <DynamicSetting />;
}