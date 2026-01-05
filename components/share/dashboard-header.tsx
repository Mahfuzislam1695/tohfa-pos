"use client";

import { LogOut, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logout } from "@/services/auth.service"
import { useState } from "react";

export function DashboardHeader() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout(); // Make sure logout is imported or available
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex-1 flex items-center gap-4">

        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{"Admin User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{"admin@example.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>{"Profile"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>{"Settings"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onSelect={(event) => {
                  event.preventDefault();
                  handleLogout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoading ? "Signing out..." : "Sign out"}</span>
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
