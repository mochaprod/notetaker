"use client";

import { Block } from "@/components/block";
import { useIntake } from "./intake-provider";

export function Notepad() {
    const {
        blocks,
        todayLabel,
        getBlockText,
        handleInput,
        insertBlockAfter,
        removeBlock,
    } = useIntake();

    return (
        <section className="flex h-full flex-col gap-4 border-b border-white/10 bg-white/10 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">

                    </h1>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex h-full flex-col gap-1 overflow-auto">
                    {blocks.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-base text-neutral-400">
                            Start typing in the notepad. Press Enter to create a new block.
                        </div>
                    ) : (
                        blocks.map((block) => (
                            <Block
                                key={block.id}
                                id={block.id}
                                text={getBlockText(block.id, block.text)}
                                onInput={handleInput}
                                onEnter={insertBlockAfter}
                                onEmptyBackspace={removeBlock}
                            />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
