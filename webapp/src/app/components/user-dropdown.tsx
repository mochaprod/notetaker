"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export function UserDropdown() {
    const session = authClient.useSession();

    const isSessionPending = !session || session.isPending || session.isRefetching;
    const isLoggedIn = !!session.data;

    const renderDropdownContent = () => {
        if (!isSessionPending) {
            return isLoggedIn ? (
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs">
                        My account
                    </DropdownMenuLabel>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={ () => authClient.signOut() }
                    >
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            ) : (
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        asChild
                        className="bg-primary hover:bg-primary"
                    >
                        <Link
                            href="/auth/sign-in"
                            className="flex justify-center"
                        >
                            Sign In
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        asChild
                    >
                        <Link
                            href="/auth/sign-up"
                            className="flex justify-center"
                        >
                            Sign Up
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            );
        } else {
            return null;
        }
    };


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                    <Avatar>
                        <AvatarFallback>PR</AvatarFallback>
                    </Avatar>
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right">
                {renderDropdownContent()}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
