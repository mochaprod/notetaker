"use client";

import { createEmptySlateDocument, DEFAULT_NOTEPAD_TITLE } from "@/lib/intake/default-document";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getDailyNotepad, getNotepadById, saveDailyNotepad, saveNotepadById } from "../actions/notepad";
import { NotepadEditor } from "./notepad-editor";
import {
    createSaveNotepadMutationOptions,
} from "./notepad-save";
import { formatLoadNotepadErrorMessage } from "./notepad-load";
import { notepadQueryKey } from "./notepad-query";
import type { NotepadReference } from "./notepad-reference";
import type { SaveStatus } from "./status-bar/save-status-label";

type NotepadProps = {
    notepadReference: NotepadReference;
    onSaveStatusChange?: (status: SaveStatus) => void;
};

export function Notepad({ notepadReference, onSaveStatusChange }: NotepadProps) {
    const queryClient = useQueryClient();
    const lastSavedAtRef = useRef<Date | null>(null);
    const queryKey = notepadQueryKey(notepadReference);

    const {
        data: document,
        error,
        isError,
        isFetching,
        isPending,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: () => notepadReference.kind === "date"
            ? getDailyNotepad(notepadReference.dateKey)
            : getNotepadById(notepadReference.notepadId),
    });

    const saveNotepadMutation = useMutation(createSaveNotepadMutationOptions(
        (payload) => notepadReference.kind === "date"
            ? saveDailyNotepad(payload)
            : saveNotepadById(payload),
        toast.error,
        (savedDocument) => {
            if (!savedDocument) {
                onSaveStatusChange?.({
                    hasError: false,
                    isLoading: false,
                    lastSavedAt: lastSavedAtRef.current,
                });
                return;
            }

            const lastSavedAt = savedDocument.updatedAt ?? new Date();
            lastSavedAtRef.current = lastSavedAt;
            queryClient.setQueryData(queryKey, savedDocument);
            onSaveStatusChange?.({
                hasError: false,
                isLoading: false,
                lastSavedAt,
            });
        },
        () => {
            onSaveStatusChange?.({
                hasError: true,
                isLoading: false,
                lastSavedAt: lastSavedAtRef.current,
            });
        },
    ));

    useEffect(() => {
        if (isPending) {
            onSaveStatusChange?.({
                hasError: false,
                isLoading: true,
                loadingState: "initial-load",
                lastSavedAt: lastSavedAtRef.current,
            });
            return;
        }

        if (isError) {
            onSaveStatusChange?.({
                hasError: true,
                isLoading: false,
                lastSavedAt: lastSavedAtRef.current,
            });
            return;
        }

        const lastSavedAt = document?.updatedAt ?? null;
        lastSavedAtRef.current = lastSavedAt;
        onSaveStatusChange?.({
            hasError: false,
            isLoading: false,
            lastSavedAt,
        });
    }, [document, isError, isPending, onSaveStatusChange]);

    if (isPending) {
        return (
            <section className="flex h-full flex-col border-neutral-200/80 bg-white/80 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-white/10" />
        );
    }

    if (isError) {
        return (
            <section className="flex h-full flex-col items-center justify-center gap-3 border-neutral-200/80 bg-white/80 p-6 text-center backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
                <p className="max-w-md whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                    { formatLoadNotepadErrorMessage(error) }
                </p>
                <button
                    type="button"
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:text-neutral-100 dark:hover:bg-white/10"
                    disabled={ isFetching }
                    onClick={ () => void refetch() }
                >
                    Retry
                </button>
            </section>
        );
    }

    if (!document && notepadReference.kind === "notepad") {
        return (
            <section className="flex h-full flex-col items-center justify-center gap-3 border-neutral-200/80 bg-white/80 p-6 text-center backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
                <p className="max-w-md whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                    { formatLoadNotepadErrorMessage(new Error("Notepad not found")) }
                </p>
            </section>
        );
    }

    const documentKey = notepadReference.kind === "date"
        ? notepadReference.dateKey
        : notepadReference.notepadId;
    const notepadDocument = document ?? {
        id: null,
        dateKey: notepadReference.kind === "date" ? notepadReference.dateKey : null,
        title: DEFAULT_NOTEPAD_TITLE,
        content: createEmptySlateDocument(),
        createdAt: null,
        updatedAt: null,
    };

    return (
        <NotepadEditor
            key={ documentKey }
            document={ notepadDocument }
            onSave={ (content) => {
                onSaveStatusChange?.({
                    hasError: false,
                    isLoading: true,
                    loadingState: "saving",
                    lastSavedAt: lastSavedAtRef.current,
                });
                saveNotepadMutation.mutate(notepadReference.kind === "date"
                    ? {
                        dateKey: notepadReference.dateKey,
                        title: notepadDocument.title,
                        content,
                    }
                    : {
                        notepadId: notepadReference.notepadId,
                        title: notepadDocument.title,
                        content,
                    });
            } }
        />
    );
}
