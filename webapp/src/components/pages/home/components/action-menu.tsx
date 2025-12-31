"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarPlusIcon, CircleAlertIcon, PlusIcon, Trash2Icon } from "lucide-react";

export type ActionMenuProps = {
    date?: Date;
};

export function ActionMenu({ date }: ActionMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                asChild
            >
                <Button
                    variant="outline"
                    aria-label="Open menu"
                    size="icon-sm"
                >
                    <PlusIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <CircleAlertIcon />
                    Mark as important
                </DropdownMenuItem>
                { date && (
                    <DropdownMenuItem>
                        <CalendarPlusIcon />
                        Add to calendar
                    </DropdownMenuItem>
                ) }
                <DropdownMenuItem
                    className="text-red-400"
                >
                    <Trash2Icon
                        className="text-red-400"
                    />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
