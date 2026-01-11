"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { HamburgerIcon, ListCheckIcon, NotebookTextIcon, PenIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "../ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { NavItem } from "./common";
import { MobileNav } from "./mobile-nav";
import { Container } from "../custom/container";
import { usePathname } from "next/navigation";

export type NavProps = {
    items: NavItem[];
};

const navItems: NavItem[] = [
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
                className="z-50 pt-2 pb-2 w-auto sm:mt-5 sm:mb-5 bottom-0 sm:relative sm:bottom-auto max-w-md rounded-lg"
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
