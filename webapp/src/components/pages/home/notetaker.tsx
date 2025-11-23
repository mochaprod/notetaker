'use client';

import { Separator } from "@/components/ui/separator";
import { Note } from "@/lib/db/db";
import { useCallback, useState } from "react";
import { Notes } from "./notes";
import { NotesForm } from "./notes-form";
import { Summarizer } from "./summarizer";
import clsx from "clsx";
import { SummaryResponse, SummaryResponseSchema } from "@/lib/llm/llm";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface NoteTakerProps {
    initialNotes?: Note[];
}

export function NoteTaker({ initialNotes }: NoteTakerProps) {
    const [notes, setNotes] = useState<Note[]>(initialNotes || []);
    const [aiSummary, setAISummary] = useState<SummaryResponse>();

    const addNoteOptimistically = useCallback((note: Note) => {
        setNotes((prevNotes) => [...prevNotes, note]);
    }, []);
    const deleteNoteOptimistically = useCallback((id: string) => {
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    }, []);

    const summarize = useCallback(async () => {
        const response = await fetch("/api/summarize");

        if (response.ok) {
            const json = await response.json();

            setAISummary(SummaryResponseSchema.parse(json.summary));
        }
    }, []);

    return (
        <main
            className="flex justify-center gap-2 container mx-auto"
        >
            <div
                className={ clsx("flex flex-col gap-2", "min-w-md max-w-md") }
            >
                <Notes
                    notes={ notes }
                    deleteNoteOptimistically={ deleteNoteOptimistically }
                />
                <Separator />
                <NotesForm
                    addNoteOptimistic={ addNoteOptimistically }
                />
                <Summarizer
                    summarize={ summarize }
                />
            </div>
            { aiSummary && (
                <div
                    className="min-w-md"
                >
                    <ul>
                        { aiSummary.tasks.map((task) => (
                            <div
                                key={ task.content }
                                className="flex items-center gap-2"
                            >
                                <Checkbox id={ task.content } />
                                <Label
                                    htmlFor={ task.content }
                                >
                                    { task.content }
                                </Label>
                            </div>
                        )) }
                    </ul>
                </div>
            ) }
        </main>
    );
}
