import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { Note } from "@/lib/db/db";
import { compareAsc, differenceInDays, format, formatRelative, startOfDay } from "date-fns";

function getTimeToDisplay(createdDate: Date): string {
    const now = new Date();
    const diffInDays = differenceInDays(now, createdDate);

    return diffInDays > 1
        ? format(createdDate, "LLL d")
        : formatRelative(createdDate, now);
}

function groupByDates(notes: Note[]): {
    date: Date;
    notes: Note[];
}[] {
    const groupedByDates = Map
        .groupBy(notes, (note) => startOfDay(note.createdAt).toISOString());

    return Array.from(groupedByDates.entries())
        .sort(([dateA], [dateB]) => compareAsc(dateA, dateB))
        .map(([date, notes]) => ({ date: new Date(date), notes }));
}

export interface NotesProps {
    notes: Note[];
}

export function Notes({ notes }: NotesProps) {
    const groupedNotes = groupByDates(notes);

    return (
        <ul
            className="flex flex-col gap-4"
        >
            { groupedNotes.map(({ date, notes }) => (
                <li
                    key={ date.toISOString() }
                    className="flex flex-col gap-2"
                >
                    <div
                        className="flex justify-center text-xs text-slate-200"
                    >
                        { getTimeToDisplay(date) }
                    </div>
                    <ul
                        className="flex flex-col gap-2"
                    >
                        { notes.map(({
                            id,
                            message,
                        }) => (
                            <Item
                                key={ id }
                                variant="outline"
                                className="bg-card border-none"
                            >
                                <ItemContent>
                                    <ItemTitle
                                        className="whitespace-pre-wrap"
                                    >
                                        { message }
                                    </ItemTitle>
                                </ItemContent>
                            </Item>
                        )) }
                    </ul>
                </li>
            )) }
        </ul>
    );
};
