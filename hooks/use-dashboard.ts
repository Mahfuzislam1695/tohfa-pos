"use client"

import { useState } from "react"
import { useGet } from "./useGet"
import { DashboardData } from "@/types/dashboard"

export const useDashboard = () => {
    const { data, isLoading, error, refetch } = useGet<any>(
        "/dashboard",
        ["dashboard"]
    )

    const dashboardData: DashboardData | null = data || null

    return {
        dashboardData,
        isLoading,
        error,
        refetch,
    }
}