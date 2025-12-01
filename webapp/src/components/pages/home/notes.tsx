"use client";

import { motion } from "motion/react";
import { deleteNote, editNote } from "@/app/actions/home/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Note } from "@/lib/db/db";
import { CheckIcon, MoreHorizontalIcon, PenIcon, TrashIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils";

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
                console.error("Failed to update note in DB.");
            }
        }

        setEditingNoteId(null);
        setEditingValue("");
    };

    const handleSubmitEditForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await handleEditNote();
    };

    return (
        <ul
            className="flex flex-col gap-2"
        >
            { notes.map(({
                id,
                createdAt,
                message,
            }) => (
                <div
                    key={ id }
                    className="flex flex-col gap-1"
                >
                    <div
                        className="text-xs text-muted-foreground flex"
                    >
                        { formatRelativeTime(new Date(createdAt), true) }
                    </div>
                    <Card
                        className="py-4"
                    >
                        <CardContent
                            className="flex justify-between items-center gap-2 px-5 text-md"
                        >
                            <div
                                className="grow"
                            >
                                { editingNoteId === id
                                    ? (
                                        <form
                                            onSubmit={ handleSubmitEditForm }
                                        >
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex flex-col gap-1"
                                            >
                                                <Textarea
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
                                                        type="submit"
                                                        variant="secondary"
                                                        className="bg-green-500"
                                                        size="icon-sm"
                                                    >
                                                        <CheckIcon />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        </form>
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
                </div>
            )) }
        </ul>
    );
};
