"use client";

import { ReactNode } from "react";
import Toast from "./Toast";

export default function ToastProvider({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
            <Toast />
        </>
    );
}