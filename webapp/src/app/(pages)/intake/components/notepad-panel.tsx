"use client";

import { useState } from "react";
import { Notepad } from "./notepad";
import {
    SaveStatusBar,
} from "./status-bar/save-status";
import type { SaveStatus } from "./status-bar/save-status-label";

export function NotepadPanel() {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>({
        isLoading: true,
        lastSavedAt: null,
    });

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1">
                <Notepad onSaveStatusChange={ setSaveStatus } />
            </div>
            <SaveStatusBar
                isLoading={ saveStatus.isLoading }
                lastSavedAt={ saveStatus.lastSavedAt }
            />
        </div>
    );
}
