import { LoadingCenter } from "@/components/share/loading-center";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Profile",
};
export default function ProfilePage() {
    const DynamicProfile = dynamic(() => import("@/components/dashboard/profile/Profile"), {
        loading: () => <LoadingCenter />
    });
    return <DynamicProfile />;
}