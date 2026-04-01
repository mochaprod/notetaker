import { PropsWithChildren } from "react";
import { SidebarLayout } from "../components/sidebar-layout";

export default function PagesLayout({ children }: PropsWithChildren) {
    return (
        <SidebarLayout>
            { children }
        </SidebarLayout>
    );
}
