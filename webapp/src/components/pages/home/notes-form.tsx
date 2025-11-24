'use client';

import { addNote } from "@/app/actions/home/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Note } from "@/lib/db/db";

export interface NotesFormProps {
    addNoteOptimistic?: (message: Note) => void;
}

export function NotesForm({ addNoteOptimistic }: NotesFormProps) {
    const submitForm = async (formData: FormData) => {
        const text = formData.get("message") as string;
        const note = await addNote(text);

        if (note) {
            addNoteOptimistic?.(note);
        }
    };

    return (
        <form action={ submitForm }>
            <div
                className="flex gap-2"
            >
                <Textarea
                    name="message"
                    placeholder="What's on your mind?"
                />
                <Button
                    type="submit"
                    className="h-auto"
                >Write</Button>
            </div>
        </form>
    );
}
