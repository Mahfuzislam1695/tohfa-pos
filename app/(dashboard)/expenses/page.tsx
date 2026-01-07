import { LoadingCenter } from "@/components/share/loading-center";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Expenses",
};
export default function ExpensesPage() {
    const DynamicExpenses = dynamic(() => import("@/components/dashboard/expenses/Expenses"), {
        loading: () => <LoadingCenter />,
    });
    return <DynamicExpenses />;
}