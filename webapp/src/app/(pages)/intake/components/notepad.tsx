"use client";

import { useSearchParamsDate } from "@/hooks/use-search-params-date";
import { formatDate } from "@/lib/date";
import { createEmptySlateDocument, DEFAULT_NOTEPAD_TITLE } from "@/lib/intake/default-document";
import type { NotepadDocument, SlateDocument } from "@common/types/intake";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createEditor, type Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import { useDebouncedCallback } from "use-debounce";
import { getNotepad, saveNotepad } from "../actions/notepad";
import { createKeyDownHandler } from "./editor/key-down-handler";
import {
    renderMarkdownElement,
    renderMarkdownLeaf,
    withMarkdownShortcuts,
} from "./editor/markdown-shortcuts";
import { notepadQueryKey } from "./notepad-query";

type NotepadEditorProps = {
    document: NotepadDocument;
};

export function Notepad() {
    const [currentDate] = useSearchParamsDate();
    const dateKey = formatDate(currentDate);
    const queryClient = useQueryClient();

    const { data: document, isPending } = useQuery({
        queryKey: notepadQueryKey(dateKey),
        queryFn: () => getNotepad(dateKey),
    });

    const saveNotepadMutation = useMutation({
        mutationFn: saveNotepad,
        onSuccess: (savedDocument) => {
            if (!savedDocument) {
                return;
            }

            queryClient.setQueryData(notepadQueryKey(savedDocument.dateKey), savedDocument);
        },
    });

    if (isPending) {
        return (
            <section className="flex h-full flex-col border-neutral-200/80 bg-white/80 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-white/10" />
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
            onSave={ (content) => saveNotepadMutation.mutate({
                dateKey: notepadDocument.dateKey,
                title: notepadDocument.title,
                content,
            }) }
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

    return (
        <section className="flex h-full flex-col border-neutral-200/80 bg-white/80 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
            <div
                className="w-1/2 mt-10 mx-auto"
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
                        className="min-h-full w-full bg-transparent text-lg leading-6 text-neutral-900 caret-neutral-950 outline-none selection:bg-neutral-900/15 selection:text-neutral-950 [&_[data-slate-placeholder='true']]:text-neutral-400 dark:text-neutral-100 dark:caret-white dark:selection:bg-white/20 dark:selection:text-white dark:[&_[data-slate-placeholder='true']]:text-neutral-500"
                        onKeyDown={ createKeyDownHandler(editor) }
                    />
                </Slate>
            </div>
        </section>
    );
}
