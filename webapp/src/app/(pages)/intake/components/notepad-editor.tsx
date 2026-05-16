"use client";

import type { NotepadDocument, SlateDocument } from "@common/types/intake";
import clsx from "clsx";
import type { MouseEvent } from "react";
import { useCallback, useState } from "react";
import { createEditor, Editor, Transforms, type Descendant } from "slate";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import { useDebouncedCallback } from "use-debounce";
import { createKeyDownHandler } from "./editor/key-down-handler";
import {
    renderMarkdownElement,
    renderMarkdownLeaf,
    withMarkdownShortcuts,
} from "./editor/markdown-shortcuts";

type NotepadEditorProps = {
    document: NotepadDocument;
    onSave: (content: SlateDocument) => void;
};

export function NotepadEditor({
    document,
    onSave,
}: NotepadEditorProps) {
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
