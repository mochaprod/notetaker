import { SidebarProvider } from "@/components/ui/sidebar";
import { PropsWithChildren } from "react";
import { AppSidebar } from "../components/app-sidebar";

export default function PagesLayout({ children }: PropsWithChildren) {
    return (
        <SidebarProvider>
            <AppSidebar />
            { children }
        </SidebarProvider>
    );
}
