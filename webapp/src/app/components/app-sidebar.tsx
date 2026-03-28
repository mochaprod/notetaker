"use client";

import { navItems } from "@/components/nav/nav";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu
                            className="gap-3"
                        >
                            { navItems.map(({ title, href, icon }) => (
                                <SidebarMenuItem
                                    key={ title }
                                >
                                    <SidebarMenuButton
                                        asChild
                                    >
                                        <Link
                                            href={ href }
                                            className="h-9"
                                        >
                                            { icon }
                                            <span
                                                className="text-lg"
                                            >
                                                { title }
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )) }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    );
}
