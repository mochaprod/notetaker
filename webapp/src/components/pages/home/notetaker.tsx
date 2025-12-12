"use client";

import { Note } from "@/lib/db/db";
import { addDays, isBefore, isSameDay, startOfDay } from "date-fns";
import { useCallback, useState } from "react";
import { DateSelector } from "./date-selector";
import { Notes } from "./notes";
import { NotesForm } from "./notes-form";

export interface NoteTakerProps {
    initialNotes?: Note[];
}

export function NoteTaker({ initialNotes }: NoteTakerProps) {
    const [notes, setNotes] = useState<Note[]>(initialNotes || []);
    const [currentDate, setCurrentDate] = useState<Date>(startOfDay(new Date()));

    const addNoteOptimistically = useCallback((note: Note) => {
        setNotes((prevNotes) => [...prevNotes, note]);
    }, []);
    const updateNoteOptimistically = useCallback((noteId: string, content: string) => {
        setNotes((prevNotes) => prevNotes.map((note) => {
            if (note.id === noteId) {
                return {
                    ...note,
                    message: content,
                };
            }
            return note;
        }));
    }, []);
    const deleteNoteOptimistically = useCallback((id: string) => {
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    }, []);
    const addDaysToDate = useCallback((offset: number) => {
        setCurrentDate((prevDate) => {
            const nextDate = addDays(prevDate, offset);
            const today = new Date();

            return isBefore(nextDate, today) || isSameDay(nextDate, today)
                ? nextDate
                : prevDate;
        });
    }, []);

    return (
        <main
            className="flex flex-col justify-center gap-5 min-w-md max-w-md mx-auto"
        >
            <NotesForm
                addNoteOptimistic={ addNoteOptimistically }
            />
            <DateSelector
                currentDate={ currentDate }
                addDaysToDate={ addDaysToDate }
                setSelectedDate={ setCurrentDate }
            />
            <Notes
                notes={ notes }
                updateNoteOptimistically={ updateNoteOptimistically }
                deleteNoteOptimistically={ deleteNoteOptimistically }
            />
        </main>
    );
}
