"use client";

import { useSearchParamsDate } from "@/hooks/use-search-params-date";
import { formatDate } from "@/lib/date";
import { createEmptySlateDocument, DEFAULT_NOTEPAD_TITLE } from "@/lib/intake/default-document";
import type { NotepadDocument, SlateDocument } from "@common/types/intake";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createEditor, Editor, Transforms, type Descendant } from "slate";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { getNotepad, saveNotepad } from "../actions/notepad";
import { createKeyDownHandler } from "./editor/key-down-handler";
import {
    renderMarkdownElement,
    renderMarkdownLeaf,
    withMarkdownShortcuts,
} from "./editor/markdown-shortcuts";
import {
    createSaveNotepadMutationOptions,
} from "./notepad-save";
import { formatLoadNotepadErrorMessage } from "./notepad-load";
import { notepadQueryKey } from "./notepad-query";
import type { SaveStatus } from "./status-bar/save-status-label";

type NotepadEditorProps = {
    document: NotepadDocument;
};

type NotepadProps = {
    onSaveStatusChange?: (status: SaveStatus) => void;
};

export function Notepad({ onSaveStatusChange }: NotepadProps) {
    const [currentDate] = useSearchParamsDate();
    const dateKey = formatDate(currentDate);
    const queryClient = useQueryClient();
    const lastSavedAtRef = useRef<Date | null>(null);

    const {
        data: document,
        error,
        isError,
        isFetching,
        isPending,
        refetch,
    } = useQuery({
        queryKey: notepadQueryKey(dateKey),
        queryFn: () => getNotepad(dateKey),
    });

    const saveNotepadMutation = useMutation(createSaveNotepadMutationOptions(
        saveNotepad,
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
            queryClient.setQueryData(notepadQueryKey(savedDocument.dateKey), savedDocument);
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

    const notepadDocument = document ?? {
        id: null,
        dateKey,
        title: DEFAULT_NOTEPAD_TITLE,
        content: createEmptySlateDocument(),
        createdAt: null,
        updatedAt: null,
    };

    return (
        <NotepadEditor
            key={ notepadDocument.dateKey }
            document={ notepadDocument }
            onSave={ (content) => {
                onSaveStatusChange?.({
                    hasError: false,
                    isLoading: true,
                    loadingState: "saving",
                    lastSavedAt: lastSavedAtRef.current,
                });
                saveNotepadMutation.mutate({
                    dateKey: notepadDocument.dateKey,
                    title: notepadDocument.title,
                    content,
                });
            } }
        />
    );
}

function NotepadEditor({
    document,
    onSave,
}: NotepadEditorProps & { onSave: (content: SlateDocument) => void }) {
    const [editor] = useState(() => withMarkdownShortcuts(withReact(createEditor())));
    const debouncedSave = useDebouncedCallback((content: SlateDocument) => {
        onSave(content);
    }, 750);
    const handleSectionMouseDown = useCallback((event: MouseEvent<HTMLElement>) => {
        const target = event.target;

        if (!(target instanceof Element) || target.closest("[data-slate-editor='true']")) {
            return;
        }

        event.preventDefault();

        if (ReactEditor.isFocused(editor)) {
            ReactEditor.blur(editor);
        } else {
            Transforms.select(editor, Editor.end(editor, []));
            ReactEditor.focus(editor);
        }
    }, [editor]);

    return (
        <section
            className="flex h-full flex-col border-neutral-200/80 bg-white/80 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-white/10"
            onMouseDown={ handleSectionMouseDown }
        >
            <div
                className="w-1/2 max-w-200 mt-10 mx-auto"
            >
                <Slate
                    editor={ editor }
                    initialValue={ document.content as Descendant[] }
                    onChange={ (content) => {
                        const hasDocumentChange = editor.operations.some((operation) => operation.type !== "set_selection");

                        if (!hasDocumentChange) {
                            return;
                        }

                        debouncedSave(content as SlateDocument);
                    } }
                >
                    <Editable
                        placeholder="Start writing..."
                        renderElement={ renderMarkdownElement }
                        renderLeaf={ renderMarkdownLeaf }
                        className={clsx(
                            "min-h-full w-full bg-transparent text-lg leading-6 outline-none",
                            "text-neutral-900 caret-neutral-950 selection:bg-neutral-900/15 selection:text-neutral-950",
                            "dark:text-neutral-100 dark:caret-white dark:selection:bg-white/20 dark:selection:text-white",
                            "**:data-[slate-placeholder=true]:top-1/2! **:data-[slate-placeholder=true]:-translate-y-1/2!",
                            "**:data-[slate-placeholder=true]:text-neutral-400 dark:**:data-[slate-placeholder=true]:text-neutral-500",
                        )}
                        onKeyDown={ createKeyDownHandler(editor) }
                    />
                </Slate>
            </div>
        </section>
    );
}
