"use client";

import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getNotepad, saveNotepad } from "../../actions/notepad";
import {
    getEditableTitle,
    getSaveDocument,
    normalizeTitle,
} from "./title-editor-helpers";
import { notepadQueryKey } from "../notepad-query";

type TitleEditorProps = {
    dateKey: string;
};

export function TitleEditor({ dateKey }: TitleEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();
    const queryKey = notepadQueryKey(dateKey);
    const { data: document } = useQuery({
        queryKey,
        queryFn: () => getNotepad(dateKey),
    });
    const title = getEditableTitle(document);
    const [draftTitle, setDraftTitle] = useState(title);
    const skipNextBlurSaveRef = useRef(false);

    useEffect(() => {
        if (!isEditing) {
            setDraftTitle(title);
        }
    }, [isEditing, title]);

    const saveTitleMutation = useMutation({
        mutationFn: saveNotepad,
        onSuccess: (savedDocument) => {
            if (!savedDocument) {
                return;
            }

            queryClient.setQueryData(notepadQueryKey(savedDocument.dateKey), savedDocument);
            setIsEditing(false);
        },
    });

    function startEditing() {
        skipNextBlurSaveRef.current = false;
        setDraftTitle(title);
        setIsEditing(true);
    }

    function cancelEditing() {
        skipNextBlurSaveRef.current = true;
        setDraftTitle(title);
        setIsEditing(false);
    }

    function saveTitle() {
        const normalizedTitle = normalizeTitle(draftTitle);

        if (normalizedTitle === title) {
            setDraftTitle(title);
            setIsEditing(false);
            return;
        }

        const saveDocument = getSaveDocument(dateKey, document);
        saveTitleMutation.mutate({
            dateKey: saveDocument.dateKey,
            title: normalizedTitle,
            content: saveDocument.content,
        });
    }

    if (isEditing) {
        return (
            <Input
                value={ draftTitle }
                autoFocus
                disabled={ saveTitleMutation.isPending }
                aria-label="Document title"
                className="h-8 max-w-sm border-transparent bg-transparent px-2 text-sm font-semibold shadow-none focus-visible:border-neutral-300 focus-visible:ring-neutral-300/50 dark:focus-visible:border-white/20 dark:focus-visible:ring-white/20"
                onChange={ (event) => setDraftTitle(event.target.value) }
                onBlur={ () => {
                    if (skipNextBlurSaveRef.current) {
                        skipNextBlurSaveRef.current = false;
                        return;
                    }

                    saveTitle();
                } }
                onKeyDown={ (event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.blur();
                        return;
                    }

                    if (event.key === "Escape") {
                        event.preventDefault();
                        cancelEditing();
                    }
                } }
            />
        );
    }

    return (
        <button
            type="button"
            className="min-w-0 truncate rounded-md px-2 py-1 text-left text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-100 dark:hover:bg-white/10 dark:focus-visible:ring-white/40"
            onClick={ startEditing }
        >
            <span className="truncate">{ title }</span>
            <span className="sr-only">Edit document title</span>
        </button>
    );
}
