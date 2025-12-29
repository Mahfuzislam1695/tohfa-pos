"use client";

import { ReactNode, useRef } from "react";
import { Provider } from "react-redux";
import { AppStore, makeStore } from "../store";

export default function StoreProvider({ children }: { children: ReactNode }) {
    // Initialize useRef with null
    const storeRef = useRef<AppStore | null>(null);

    // Create the store if it doesn't exist
    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    // Render the Provider with the store
    return <Provider store={storeRef.current}>{children}</Provider>;
}