"use client";

import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { CheckIcon, MoreHorizontalIcon, PenIcon, TrashIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Note } from "../../../../../packages/types/src/notes";
import { useNow } from "@/hooks/use-now";

export interface NotesProps {
    notes: Note[];
    isLoading?: boolean;
    updateNoteOptimistically: (id: string, content: string) => void;
    deleteNoteOptimistically: (id: string) => void;
}

export function Notes({
    notes,
    isLoading,
    updateNoteOptimistically,
    deleteNoteOptimistically,
}: NotesProps) {
    const { data: now } = useNow();
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState("");

    const createEditNote = (id: string) => () => {
        setEditingNoteId(id);
        const note = notes.find((note) => note.id === id);
        if (note) {
            setEditingValue(note.message);
        }
    };

    const createDeleteNote = (id: string) => () => {
        deleteNoteOptimistically(id);
    };

    const handleEditNote = () => {
        if (!editingNoteId) {
            return;
        }

        const currentNote = notes.find(({ id }) => editingNoteId === id);

        if (currentNote && currentNote.message !== editingValue) {
            updateNoteOptimistically(editingNoteId, editingValue);
        }

        setEditingNoteId(null);
        setEditingValue("");
    };

    const handleSubmitEditForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleEditNote();
    };

    if (!isLoading && (!notes || notes.length === 0)) {
        return (
            <div
                className="flex justify-center mt-10"
            >
                No notes found
            </div>
        );
    }

    return (
        <ul
            className="flex flex-col gap-2"
        >
            <AnimatePresence
                initial={ false }
                mode="popLayout"
            >
                { notes.map(({
                    id,
                    createdAt,
                    message,
                }) => (
                    <motion.div
                        key={ id }
                        layout
                        className="flex flex-col gap-1"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                            type: "spring",
                            bounce: 0.2,
                        }}
                    >
                        <div
                            className="text-xs text-muted-foreground flex"
                        >
                            { formatRelativeTime(new Date(createdAt), now) }
                        </div>
                        <Card
                            className="py-2"
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
                    </motion.div>
                )) }
            </AnimatePresence>
        </ul>
    );
};
