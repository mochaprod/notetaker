"use client";

import { deleteNote, editNote } from "@/app/actions/home/actions";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Item, ItemActions, ItemContent, ItemDescription } from "@/components/ui/item";
import { Textarea } from "@/components/ui/textarea";
import { Note } from "@/lib/db/db";
import { LOGGER } from "@/lib/logger";
import { differenceInDays, format, formatDistanceToNow, startOfDay } from "date-fns";
import { CheckIcon, MoreHorizontalIcon, PenIcon, TrashIcon, XIcon } from "lucide-react";
import { useState } from "react";

function getTimeToDisplay(createdDate: Date): string {
    const now = new Date();
    const diffInDays = differenceInDays(startOfDay(now), startOfDay(createdDate));

    if (diffInDays === 0) {
        return "Today";
    }

    if (diffInDays === 1) {
        return "Yesterday";
    }

    if (diffInDays < 5) {
        return formatDistanceToNow(createdDate, { addSuffix: true });
    }

    return format(createdDate, "LLL d");
}

export interface NotesProps {
    notes: Note[];
    updateNoteOptimistically: (id: string, content: string) => void;
    deleteNoteOptimistically: (id: string) => void;
}

export function Notes({
    notes,
    updateNoteOptimistically,
    deleteNoteOptimistically,
}: NotesProps) {
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState("");

    const createEditNote = (id: string) => async () => {
        setEditingNoteId(id);

        const note = notes.find((note) => note.id === id);

        if (note) {
            setEditingValue(note.message);
        }
    };

    const createDeleteNote = (id: string) => async () => {
        await deleteNote(id);
        deleteNoteOptimistically(id);
    };

    const handleEditNote = async () => {
        if (!editingNoteId) {
            return;
        }

        const currentNote = notes.find(({ id }) => editingNoteId === id);

        if (currentNote && currentNote.message !== editingValue) {
            updateNoteOptimistically(editingNoteId, editingValue);

            try {
                await editNote(editingNoteId, editingValue);
            } catch (error) {
                updateNoteOptimistically(editingNoteId, currentNote.message);
                LOGGER.error("Failed to update note in DB.");
            }
        }

        setEditingNoteId(null);
        setEditingValue("");
    };

    return (
        <ul
            className="flex flex-col gap-2"
        >
            { notes.map(({
                id,
                message,
            }) => (
                <Card
                    key={ id }
                    className="py-4"
                >
                    <CardContent
                        className="flex justify-between items-center gap-2 px-5"
                    >
                        <div
                            className="grow"
                        >
                            { editingNoteId === id
                                ? (
                                    <div
                                        className="flex flex-col gap-1"
                                    >
                                        <Textarea
                                            name="message"
                                            value={ editingValue }
                                            onChange={ (e) => setEditingValue(e.target.value) }
                                        />
                                        <div
                                            className="flex gap-1 justify-end"
                                        >
                                            <Button
                                                variant="secondary"
                                                size="icon-sm"
                                                onClick={ () => setEditingNoteId(null) }
                                            >
                                                <XIcon />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                className="bg-green-500"
                                                size="icon-sm"
                                                onClick={ handleEditNote }
                                            >
                                                <CheckIcon />
                                            </Button>
                                        </div>
                                    </div>
                                )
                                : message }
                        </div>
                        <div
                            className="self-start"
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    asChild
                                >
                                    <Button
                                        variant="ghost"
                                        aria-label="Open menu"
                                        size="icon-sm"
                                    >
                                        <MoreHorizontalIcon />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onClick={ createEditNote(id) }
                                    >
                                        <PenIcon />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-400"
                                        onClick={ createDeleteNote(id) }
                                    >
                                        <TrashIcon
                                            className="text-red-400"
                                        />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>
            )) }
        </ul>
    );
};
