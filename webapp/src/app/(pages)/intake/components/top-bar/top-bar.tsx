"use client";

import type { NotepadReference } from "../notepad-reference";
import { DateSelector } from "./date-selector";
import { TitleEditor } from "./title-editor";

type TopBarProps = {
    notepadReference: NotepadReference;
};

export function TopBar({ notepadReference }: TopBarProps) {
    return (
        <div className="flex h-12 items-center justify-between gap-3 border-b border-neutral-200/80 bg-white/80 px-3 backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
            <TitleEditor notepadReference={ notepadReference } />
            <DateSelector notepadReference={ notepadReference } />
        </div>
    );
}
