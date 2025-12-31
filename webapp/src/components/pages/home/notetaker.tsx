"use client";

import { addDays, format, isBefore, isSameDay, parse, startOfDay } from "date-fns";
import { useCallback } from "react";
import { DateSelector } from "./date-selector";
import { Notes } from "./notes";
import { NotesForm } from "./notes-form";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotesByDate } from "@/lib/api";
import { addNote, editNote, deleteNote } from "@/app/actions/home/actions";
import { Note } from "@common/types/notes";
import { authClient } from "@/lib/auth-client";

function dateString(date: Date): string {
    try {
        return format(date, "yyyy-MM-dd");
    } catch (e) {
        return format(startOfDay(new Date()), "yyyy-MM-dd");
    }
}

function parseDate(dateStr: string | null): Date {
    if (dateStr) {
        const date = parse(dateStr, "yyyy-MM-dd", new Date());

        if (!isNaN(date.getTime())) {
            return date;
        }
    }

    return startOfDay(new Date());
}

export function NoteTaker() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentDate = parseDate(searchParams.get("date"));
    const currentDateQueryKey = ["notes", dateString(currentDate)];
    const todayQueryKey = ["notes", dateString(startOfDay(new Date()))];
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

    const addDaysToDate = useCallback((offset: number) => {
        const nextDate = addDays(currentDate, offset);
        const today = new Date();
        const dateToSet = isBefore(nextDate, today) || isSameDay(nextDate, today) ? nextDate : currentDate;
        router.push(`?date=${dateString(dateToSet)}`);
    }, [currentDate, router]);

    const selectDate = useCallback((date: Date) => {
        try {
            router.push(`?date=${dateString(date)}`);
        } catch (e) {
            console.error("Selected date is not formatted correctly.");
            router.push("/");
        }
    }, [router]);

    return (
        <main className="flex flex-col justify-center gap-5 min-w-md max-w-md mx-auto">
            <div>
                Welcome, { session?.data?.user.name }
            </div>
            <NotesForm
                addNewNote={ (text) => addNoteMutation.mutate(text) }
            />
            <DateSelector
                currentDate={ currentDate }
                addDaysToDate={ addDaysToDate }
                selectDate={ selectDate }
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
