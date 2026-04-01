"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Block = {
    id: string;
    text: string;
};

const initialBlocks: Block[] = [
    {
        id: "block-1",
        text: "Morning standup notes: blocked on auth tests, need schema update.",
    },
    {
        id: "block-2",
        text: "Ideas: summarize notes by day, show actionable tasks with dates.",
    },
    {
        id: "block-3",
        text: "Follow up with design on sidebar layout for notes and digest.",
    },
];

const summarizeLine = (text: string) => {
    if (!text.trim()) {
        return "Empty line. Add a note to generate a summary.";
    }
    const trimmed = text.trim();
    if (trimmed.length <= 120) {
        return trimmed;
    }
    return `${trimmed.slice(0, 120)}…`;
};

export default function IntakePage() {
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
    const [focusId, setFocusId] = useState<string | null>(null);
    const [summaryVersion, setSummaryVersion] = useState(0);
    const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const blockTextRef = useRef<Record<string, string>>({});

    useEffect(() => {
        initialBlocks.forEach((block) => {
            blockTextRef.current[block.id] = block.text;
        });
    }, []);

    useEffect(() => {
        if (focusId && blockRefs.current[focusId]) {
            const el = blockRefs.current[focusId];
            requestAnimationFrame(() => {
                el?.focus();
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(el!);
                range.collapse(false);
                selection?.removeAllRanges();
                selection?.addRange(range);
            });
            setFocusId(null);
        }
    }, [focusId]);

    const handleInput = (id: string, value: string) => {
        blockTextRef.current[id] = value;
        setSummaryVersion((current) => current + 1);
    };

    const insertBlockAfter = (id: string) => {
        setBlocks((current) => {
            const index = current.findIndex((block) => block.id === id);
            const newBlock: Block = {
                id: `block-${Date.now()}`,
                text: "",
            };
            blockTextRef.current[newBlock.id] = "";
            const next = [...current];
            next.splice(index + 1, 0, newBlock);
            setFocusId(newBlock.id);
            return next;
        });
    };

    const removeBlock = (id: string) => {
        setBlocks((current) => {
            if (current.length <= 1) {
                return current;
            }
            const index = current.findIndex((block) => block.id === id);
            const next = current.filter((block) => block.id !== id);
            delete blockTextRef.current[id];
            const focusTarget = next[Math.max(0, index - 1)];
            setFocusId(focusTarget?.id ?? null);
            return next;
        });
    };

    const escapeHtml = (value: string) =>
        value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const toHtml = (value: string) => escapeHtml(value).replace(/\n/g, "<br />");

    const emptyState = useMemo(
        () => (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-base text-neutral-400">
                Start typing in the notepad. Press Enter to create a new block.
            </div>
        ),
        []
    );

    return (
        <div className="h-svh bg-neutral-950 text-neutral-100">
            <div className="grid flex-1 grid-cols-10 h-full">
                <section className="col-span-7 flex h-full flex-col gap-4 border-b border-white/10 bg-white/10 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Notepad</h2>
                            <p className="text-xs text-neutral-400">
                                Lines flow together like a single sheet.
                            </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-neutral-300">
                            {blocks.length} lines
                        </span>
                    </div>

                    <div className="flex-1 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(transparent_33px,rgba(255,255,255,0.06)_34px)] bg-[length:100%_34px]">
                        <div className="flex h-full flex-col divide-y divide-white/5 overflow-auto px-4 py-3">
                            {blocks.length === 0 ? (
                                emptyState
                            ) : (
                                blocks.map((block) => (
                                    <div
                                        key={block.id}
                                        className="flex items-start py-2"
                                    >
                                        <div
                                            ref={(el) => {
                                                blockRefs.current[block.id] = el;
                                            }}
                                            contentEditable
                                            suppressContentEditableWarning
                                            data-placeholder="Start typing..."
                                            className="min-h-[30px] w-full whitespace-pre-wrap break-words bg-transparent text-base leading-7 text-neutral-100 outline-none transition focus:text-white empty:before:text-neutral-600 empty:before:content-[attr(data-placeholder)]"
                                            dangerouslySetInnerHTML={{
                                                __html: toHtml(block.text),
                                            }}
                                            onInput={(event) =>
                                                handleInput(
                                                    block.id,
                                                    (event.currentTarget.innerText ?? "").replace(/\u00a0/g, " ")
                                                )
                                            }
                                            onPaste={(event) => {
                                                event.preventDefault();
                                                const text = event.clipboardData.getData("text/plain");
                                                document.execCommand("insertText", false, text);
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" && !event.shiftKey) {
                                                    event.preventDefault();
                                                    insertBlockAfter(block.id);
                                                    return;
                                                }
                                                const currentText = blockTextRef.current[block.id] ?? "";
                                                if (event.key === "Backspace" && currentText.length === 0) {
                                                    event.preventDefault();
                                                    removeBlock(block.id);
                                                }
                                            }}
                                        >
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <section className="col-span-3 flex h-full flex-col border-l border-b border-white/10 bg-white/5 p-4">
                    <div className="flex h-full flex-col gap-3 overflow-auto pr-1">
                        <span className="hidden">{summaryVersion}</span>
                        {blocks.map((block, index) => (
                            <article
                                key={block.id}
                                className="rounded-2xl border border-white/10 bg-neutral-950/70 p-4 shadow-[0_15px_45px_-30px_rgba(0,0,0,0.8)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-base font-semibold text-neutral-100">
                                            Line {index + 1}
                                        </h3>
                                        <p className="text-xs text-neutral-400">
                                            Note-derived summary
                                        </p>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                                        Intake
                                    </span>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-neutral-300">
                                    {summarizeLine(blockTextRef.current[block.id] ?? block.text)}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
