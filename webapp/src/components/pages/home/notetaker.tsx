"use client";

import { deleteNote, editNote } from "@/app/actions/home/actions";
import { Container } from "@/components/custom/container";
import { QueryParamsDateSelector } from "@/components/custom/query-params-date-selector";
import { Button } from "@/components/ui/button";
import { fetchNotesByDate } from "@/lib/api";
import { formatDate } from "@/lib/llm/tools";
import { parseDate } from "@/lib/utils";
import { Note } from "../../../../../packages/types/src/notes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SparklesIcon, WandSparklesIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Notes } from "./notes";

export function NoteTaker() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const searchParamsDate = searchParams.get("date");
    const currentDate = parseDate(searchParamsDate);
    const currentDateQueryKey = ["notes", formatDate(currentDate)];

    const { data: notes, isLoading } = useQuery({
        queryKey: currentDateQueryKey,
        queryFn: async () => fetchNotesByDate(currentDate),
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
        <Container
            className="flex flex-col gap-6"
        >
            <h1
                className="text-3xl font-semibold"
            >
                Notes
            </h1>
            <QueryParamsDateSelector
                action={
                    <Button
                        asChild
                        size="sm"
                        disabled={ !notes || !notes.length }
                    >
                    <Link
                        href={`/digest?date=${formatDate(currentDate)}`}
                    >
                        <WandSparklesIcon />
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
        </Container>
    );
}
