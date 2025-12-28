import { Loader } from "lucide-react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
    title: "Tohfa | Expenses",
};
export default function ExpensesPage() {
    const DynamicExpenses = dynamic(() => import("@/components/dashboard/expenses/Expenses"), {
        loading: () => <Loader className="animate-spin" />,
    });
    return <DynamicExpenses />;
}