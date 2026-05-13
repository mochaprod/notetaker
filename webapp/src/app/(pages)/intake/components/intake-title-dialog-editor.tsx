"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getNotepad, saveNotepad } from "../actions/notepad";
import {
    getEditableTitle,
    getSaveDocument,
    normalizeTitle,
} from "./intake-title-editor-helpers";
import { notepadQueryKey } from "./notepad-query";

type IntakeTitleDialogEditorProps = {
    dateKey: string;
};

export function IntakeTitleDialogEditor({ dateKey }: IntakeTitleDialogEditorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const queryKey = notepadQueryKey(dateKey);
    const { data: document } = useQuery({
        queryKey,
        queryFn: () => getNotepad(dateKey),
    });
    const title = getEditableTitle(document);
    const [draftTitle, setDraftTitle] = useState(title);

    useEffect(() => {
        if (!isOpen) {
            setDraftTitle(title);
        }
    }, [isOpen, title]);

    const saveTitleMutation = useMutation({
        mutationFn: saveNotepad,
        onSuccess: (savedDocument) => {
            if (!savedDocument) {
                return;
            }

            queryClient.setQueryData(notepadQueryKey(savedDocument.dateKey), savedDocument);
            setIsOpen(false);
        },
    });

    return (
        <Dialog
            open={ isOpen }
            onOpenChange={ (nextOpen) => {
                if (nextOpen) {
                    setDraftTitle(title);
                }

                setIsOpen(nextOpen);
            } }
        >
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="min-w-0 truncate rounded-md px-2 py-1 text-left text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-100 dark:hover:bg-white/10 dark:focus-visible:ring-white/40"
                >
                    <span className="truncate">{ title }</span>
                    <span className="sr-only">Edit document title</span>
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename document</DialogTitle>
                </DialogHeader>
                <form
                    className="grid gap-4"
                    onSubmit={ (event) => {
                        event.preventDefault();

                        const saveDocument = getSaveDocument(dateKey, document);
                        saveTitleMutation.mutate({
                            dateKey: saveDocument.dateKey,
                            title: normalizeTitle(draftTitle),
                            content: saveDocument.content,
                        });
                    } }
                >
                    <div className="grid gap-2">
                        <Input
                            value={ draftTitle }
                            autoFocus
                            onChange={ (event) => setDraftTitle(event.target.value) }
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={ () => setIsOpen(false) }
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={ saveTitleMutation.isPending }
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
