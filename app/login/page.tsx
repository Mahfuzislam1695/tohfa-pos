import { LoadingCenter } from "@/components/share/loading-center";
import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Login",
};
export default function LoginPage() {
    const DynamicLogin = dynamic(() => import("@/components/login/Login"), {
        loading: () => <LoadingCenter />,
    });
    return <DynamicLogin />;
}