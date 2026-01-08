"use client";

import { addNote, deleteNote, editNote } from "@/app/actions/home/actions";
import { QueryParamsDateSelector } from "@/components/custom/query-params-date-selector";
import { fetchNotesByDate } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/llm/tools";
import { parseDate } from "@/lib/utils";
import { Note } from "@common/types/notes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startOfDay } from "date-fns";
import { useSearchParams } from "next/navigation";
import { Notes } from "./notes";
import { NotesForm } from "./notes-form";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";
import Link from "next/link";

export function NoteTaker() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const searchParamsDate = searchParams.get("date");
    const currentDate = parseDate(searchParamsDate);
    const currentDateQueryKey = ["notes", formatDate(currentDate)];
    const todayQueryKey = ["notes", formatDate(startOfDay(new Date()))];
    const session = authClient.useSession();

    const { data: notes, isLoading } = useQuery({
        queryKey: currentDateQueryKey,
        queryFn: async () => fetchNotesByDate(currentDate),
    });

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

    const editNoteMutation = useMutation({
        mutationFn: ({ id, content }: { id: string, content: string }) => editNote(id, content),
        onMutate: async ({ id, content }: { id: string, content: string }) => {
            await queryClient.cancelQueries({ queryKey: currentDateQueryKey });
            const previousNotes = queryClient.getQueryData<Note[]>(currentDateQueryKey);
            queryClient.setQueryData<Note[]>(currentDateQueryKey, (old) =>
                old?.map(note => note.id === id ? { ...note, message: content } : note)
            );
            return { previousNotes };
        },
        onError: (err, newNote, context) => {
            queryClient.setQueryData(currentDateQueryKey, context?.previousNotes);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: currentDateQueryKey });
        },
    });

    const deleteNoteMutation = useMutation({
        mutationFn: deleteNote,
        onMutate: async (noteId: string) => {
            await queryClient.cancelQueries({ queryKey: currentDateQueryKey });
            const previousNotes = queryClient.getQueryData<Note[]>(currentDateQueryKey);
            queryClient.setQueryData<Note[]>(currentDateQueryKey, (old) => old?.filter(note => note.id !== noteId));
            return { previousNotes };
        },
        onError: (err, newNote, context) => {
            queryClient.setQueryData(currentDateQueryKey, context?.previousNotes);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: currentDateQueryKey });
        },
    });

    return (
        <main className="flex flex-col justify-center gap-5 min-w-md max-w-md mx-auto">
            <div>
                Welcome, { session?.data?.user.name }
            </div>
            <NotesForm
                addNewNote={ (text) => addNoteMutation.mutate(text) }
            />
            <QueryParamsDateSelector
                action={
                    <Button
                        asChild
                        disabled={ !notes || !notes.length }
                    >
                    <Link
                        href={`/digest?date=${searchParamsDate}`}
                    >
                        <SparklesIcon />
                        Summarize
                    </Link>
                    </Button>
                }
            />
            <Notes
                notes={ notes || [] }
                isLoading={ isLoading }
                updateNoteOptimistically={ (id, content) => editNoteMutation.mutate({ id, content }) }
                deleteNoteOptimistically={ (id) => deleteNoteMutation.mutate(id) }
            />
        </main>
    );
}
