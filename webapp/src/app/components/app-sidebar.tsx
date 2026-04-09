"use client";

import { navItems } from "@/components/nav/nav";
import { useTheme } from "@/components/theme/theme-provider";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LaptopMinimalIcon, MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { UserDropdown } from "./user-dropdown";

export function AppSidebar() {
    const { mounted, theme, resolvedTheme, toggleTheme } = useTheme();

    const themeMode = mounted ? theme : "system";
    const themeDescriptor = mounted ? resolvedTheme : undefined;

    const themeLabel = themeMode === "system"
        ? themeDescriptor
            ? `Theme: System (${themeDescriptor})`
            : "Theme: System"
        : `Theme: ${themeMode[0].toUpperCase()}${themeMode.slice(1)}`;

    const ThemeIcon = themeMode === "light"
        ? SunIcon
        : themeMode === "dark"
          ? MoonIcon
          : LaptopMinimalIcon;

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <UserDropdown />
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-3">
                            {navItems.map(({ title, href, icon }) => (
                                <SidebarMenuItem key={title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={href} className="h-9">
                                            {icon}
                                            <span className="text-lg">
                                                {title}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={ toggleTheme }
                            tooltip={ themeLabel }
                            className="h-10"
                        >
                            <ThemeIcon />
                            <span>{ themeLabel }</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
