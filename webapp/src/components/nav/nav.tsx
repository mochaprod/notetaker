"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { ListCheckIcon, NotebookTextIcon, PenIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "../custom/container";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "../ui/navigation-menu";
import { NavItem } from "./common";
import { MobileNav } from "./mobile-nav";

export type NavProps = {
    items: NavItem[];
};

export const navItems: NavItem[] = [
    {
        title: "Write",
        href: "/write",
        icon: (
            <PenIcon />
        ),
    },
    {
        title: "Notes",
        href: "/notes",
        icon: (
            <NotebookTextIcon />
        ),
    },
    {
        title: "Digest",
        href: "/digest",
        icon: (
            <SparklesIcon />
        ),
    },
    {
        title: "Todos",
        href: "/todos",
        icon: (
            <ListCheckIcon />
        ),
    },
];

export function Nav() {
    const pathname = usePathname();
    const isMobile = useIsMobile();

    const nav = (
        <Container
            as="div"
        >
            <NavigationMenu
                className="z-50 w-auto sm:my-3 bottom-0 sm:relative sm:bottom-auto max-w-md rounded-lg"
            >
                <NavigationMenuList
                    className="w-full gap-3 sm:gap-2"
                >
                    { navItems.map(({
                        title,
                        href,
                        icon,
                    }) => (
                        <NavigationMenuItem
                            key={ title }
                        >
                            <NavigationMenuLink
                                asChild
                                data-active={ pathname === href }
                                className="h-10 sm:h-auto px-3"
                            >
                                <Link
                                    href={ href }
                                    className="flex flex-row items-center gap-1"
                                >
                                    { icon }
                                    { title }
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    )) }
                </NavigationMenuList>
            </NavigationMenu>
        </Container>
    );

    return isMobile
        ? (
            <MobileNav
                items={ navItems }
            />
        )
        : nav;
}
