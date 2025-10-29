'use client';

import { Note } from "@/lib/db/db";
import { useCallback, useState } from "react";
import { Notes } from "./notes";
import { NotesForm } from "./notes-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IconSparkles } from "@tabler/icons-react";

export interface NoteTakerProps {
    initialNotes?: Note[];
}

export function NoteTaker({ initialNotes }: NoteTakerProps) {
    const [notes, setNotes] = useState<Note[]>(initialNotes || []);

    const addNoteOptimistic = useCallback((note: Note) => {
        setNotes((prevNotes) => [...prevNotes, note]);
    }, []);

    return (
        <div
            className="flex flex-col gap-2"
        >
            <Notes
                notes={ notes }
            />
            <Separator />
            <NotesForm
                addNoteOptimistic={ addNoteOptimistic }
            />
            <Button
                type="button"
            >
                <IconSparkles />
                Summarize
            </Button>
        </div>
    );
}
