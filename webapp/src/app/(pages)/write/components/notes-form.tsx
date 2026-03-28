import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenIcon } from "lucide-react";
import { useRef } from "react";

export interface NotesFormProps {
    addNewNote: (noteText: string) => void;
}

export function NotesForm({ addNewNote }: NotesFormProps) {
    const formRef = useRef<HTMLFormElement>(null);

    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const text = formData.get("message") as string;

        if (text) {
            addNewNote(text);
            formRef.current?.reset();
        }
    };

    return (
        <form ref={formRef} onSubmit={ submitForm }>
            <div
                className="flex flex-col gap-2"
            >
                <Textarea
                    name="message"
                    placeholder="What's on your mind?"
                    className="text-2xl! leading-relaxed min-h-68"
                />
                <Button
                    type="submit"
                    size="lg"
                >
                    <PenIcon />
                    Write
                </Button>
            </div>
        </form>
    );
}
