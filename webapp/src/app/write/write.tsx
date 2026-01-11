"use client";

import { Container } from "@/components/custom/container";
import { NotesForm } from "@/components/pages/home/notes-form";
import { formatDate } from "@/lib/llm/tools";
import { Note } from "@common/types/notes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startOfDay } from "date-fns";
import { addNote } from "../actions/home/actions";

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
                createdAt: new Date().toISOString(),
            };
            queryClient.setQueryData<Note[]>(todayQueryKey, (old) => [newNoteTemp, ...(old || [])]);
            return { previousNotes, newNoteTempId };
        },
        onError: (err, newNote, context) => {
            queryClient.setQueryData(todayQueryKey, context?.previousNotes);
        },
    });

    return (
        <Container>
            <NotesForm
                addNewNote={ (text) => addNoteMutation.mutate(text) }
            />
        </Container>
    );
}

