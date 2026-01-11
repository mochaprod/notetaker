import { MenuIcon } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { NavProps } from "./nav";
import Link from "next/link";

export function MobileNav({ items }: NavProps) {
    return (
        <div
            className="fixed bottom-5 right-5"
        >
            <DropdownMenu>
                <DropdownMenuTrigger
                    asChild
                >
                    <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full w-12 h-12"
                    >
                        <MenuIcon
                            className="w-5! h-5!"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                >
                    { items.map(({
                        title,
                        href,
                        icon,
                    }) => (
                        <DropdownMenuItem
                            asChild
                            key={ title }
                                className="text-md"
                        >
                            <Link
                                href={ href }
                            >
                                { icon }
                                { title }
                            </Link>
                        </DropdownMenuItem>
                    )) }
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
