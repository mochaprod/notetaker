import { SidebarProvider } from "@/components/ui/sidebar";
import { PropsWithChildren } from "react";
import { AppSidebar } from "./app-sidebar";

export async function SidebarLayout({ children }: PropsWithChildren) {
    return (
        <SidebarProvider
            defaultOpen={ false }
        >
            <AppSidebar />
            { children }
        </SidebarProvider>
    );
}
