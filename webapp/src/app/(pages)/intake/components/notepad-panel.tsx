"use client";

import { useState } from "react";
import { Notepad } from "./notepad";
import type { NotepadReference } from "./notepad-reference";
import {
    SaveStatusBar,
} from "./status-bar/save-status";
import type { SaveStatus } from "./status-bar/save-status-label";

type NotepadPanelProps = {
    notepadReference: NotepadReference;
};

export function NotepadPanel({ notepadReference }: NotepadPanelProps) {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>({
        hasError: false,
        isLoading: true,
        loadingState: "initial-load",
        lastSavedAt: null,
    });

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1">
                <Notepad
                    notepadReference={ notepadReference }
                    onSaveStatusChange={ setSaveStatus }
                />
            </div>
            <SaveStatusBar
                hasError={ saveStatus.hasError }
                isLoading={ saveStatus.isLoading }
                loadingState={ saveStatus.loadingState }
                lastSavedAt={ saveStatus.lastSavedAt }
            />
        </div>
    );
}
