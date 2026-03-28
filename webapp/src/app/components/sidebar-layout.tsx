"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { PropsWithChildren } from "react";

export function SidebarLayout({ children }: PropsWithChildren) {
    return (
        <SidebarProvider>
            <AppSidebar />
            { children }
        </SidebarProvider>
    );
}
