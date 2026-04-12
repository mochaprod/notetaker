"use client";

import { useMemo, useState } from "react";
import { createEditor } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import { createKeyDownHandler } from "./editor/key-down-handler";
import { initialEditorValue, renderMarkdownElement, withMarkdownShortcuts } from "./editor/markdown-shortcuts";

export function Notepad() {
    const editor = useMemo(() => withMarkdownShortcuts(withReact(createEditor())), []);
    const [enterEventTick, setEnterEventTick] = useState(0);

    return (
        <section className="flex h-full flex-col gap-4 border-b border-neutral-200/80 bg-white/80 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
            <Slate
                editor={ editor }
                initialValue={ initialEditorValue }
                onChange={() => {
                    const didCreateLine = editor.operations.some((operation) => {
                        return operation.type === "split_node" && operation.path.length <= 2;
                    });

                    if (!didCreateLine) {
                        return;
                    }

                    setEnterEventTick((previousTick) => previousTick + 1);
                }}
            >
                <Editable
                    placeholder="Start writing..."
                    renderElement={ renderMarkdownElement }
                    className="min-h-full w-full bg-transparent text-lg leading-8 text-neutral-900 caret-neutral-950 outline-none selection:bg-neutral-900/15 selection:text-neutral-950 [&_[data-slate-placeholder='true']]:text-neutral-400 dark:text-neutral-100 dark:caret-white dark:selection:bg-white/20 dark:selection:text-white dark:[&_[data-slate-placeholder='true']]:text-neutral-500"
                    onKeyDown={ createKeyDownHandler(editor) }
                />
            </Slate>
        </section>
    );
}
