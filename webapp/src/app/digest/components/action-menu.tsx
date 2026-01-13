"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Task } from "@common/types/summary";
import clsx from "clsx";
import { CalendarPlusIcon, CheckIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useCallback, useState } from "react";
import { addTodo } from "../actions/add-todo";

export type ActionMenuProps = {
    task: Task;
};

export function ActionMenu({ task }: ActionMenuProps) {
    const [isGreen, setGreen] = useState(false);

    const date = task.datetime;

    const handleAddToList = useCallback(async () => {
        await addTodo({
            content: task.content,
            done: false,
            datetime: date,
            important: false,
        });

        setGreen(true);
    }, []);

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
                <DropdownMenuItem
                    className={ clsx(isGreen && "text-green-500") }
                    onClick={ handleAddToList }
                >
                    { isGreen
                        ? (
                            <CheckIcon
                                className="text-green-500"
                            />
                        )
                        : (
                            <PlusIcon />
                        ) }
                    { isGreen ? "Added to list" : "Add to list" }
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
