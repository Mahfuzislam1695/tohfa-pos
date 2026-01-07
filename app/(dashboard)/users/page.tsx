import { LoadingCenter } from "@/components/share/loading-center";
import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Users",
};
export default function UsersPage() {
    const DynamicUsers = dynamic(() => import("@/components/dashboard/users/Users"), {
        loading: () => <LoadingCenter />,
    });
    return <DynamicUsers />;
}