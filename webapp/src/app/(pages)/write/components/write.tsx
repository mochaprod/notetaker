"use client";

import { Container } from "@/components/custom/container";
import { formatDate } from "@/lib/date";
import { Note } from "@common/types/notes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startOfDay } from "date-fns";
import { NotesForm } from "./notes-form";
import { addNote } from "@/app/actions/home/actions";

export function Write() {
    const queryClient = useQueryClient();
    const todayQueryKey = ["notes", formatDate(startOfDay(new Date()))];

    const addNoteMutation = useMutation({
        mutationFn: addNote,
        onMutate: async (newNoteText: string) => {
            await queryClient.cancelQueries({ queryKey: todayQueryKey });
            const previousNotes = queryClient.getQueryData<Note[]>(todayQueryKey);
            const newNoteTempId = Math.random().toString();
            const newNoteTemp: Note = {
                id: newNoteTempId,
                key: "default",
                message: newNoteText,
                createdAt: new Date(),
            };
            queryClient.setQueryData<Note[]>(todayQueryKey, (old) => [newNoteTemp, ...(old || [])]);
            return { previousNotes, newNoteTempId };
        },
        onError: (err, newNote, context) => {
            queryClient.setQueryData(todayQueryKey, context?.previousNotes);
        },
    });

    return (
        <Container
            className="flex gap-6"
        >
            <h1
                className="text-3xl font-bold"
            >
                Write
            </h1>
            <NotesForm
                addNewNote={ (text) => addNoteMutation.mutate(text) }
            />
        </Container>
    );
}

