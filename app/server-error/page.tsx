"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getBaseUrl } from "@/config/envConfig";

export default function ServerErrorPage() {
  const [countdown, setCountdown] = useState(5);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Set up countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          checkServerStatus();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const checkServerStatus = async () => {
    setIsChecking(true);
    try {
      // Try to connect to the server
      const response = await fetch(`${getBaseUrl()}/health`, {
        method: "HEAD",
        cache: "no-store",
      });

      if (response.ok) {
        // Server is back online, redirect to the original page
        const originalPath = localStorage.getItem("originalPath") || "/";
        window.location.href = originalPath;
      }
    } catch (error) {
      // Server still offline
      console.log("Server still offline");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[450px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">Server Unavailable</CardTitle>
          <CardDescription>
            We're having trouble connecting to our servers
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-red-500"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 16v-3a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"></path>
              <circle cx="12" cy="9" r="2"></circle>
            </svg>
          </div>
          <p className="mb-4">
            Our server is currently offline or experiencing connectivity issues. We're automatically checking for connectivity.
          </p>
          <p className="text-sm text-gray-500">
            Next check in: {countdown} seconds
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={checkServerStatus}
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? "Checking..." : "Check Now"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}