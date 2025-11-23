import { deleteNote } from "@/app/actions/home/actions";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Note } from "@/lib/db/db";
import { compareAsc, differenceInDays, format, formatDistanceToNow, formatRelative, startOfDay } from "date-fns";
import { MoreHorizontalIcon, PenIcon, TrashIcon } from "lucide-react";

function getTimeToDisplay(createdDate: Date): string {
    const now = new Date();
    const diffInDays = differenceInDays(startOfDay(now), startOfDay(createdDate));

    if (diffInDays === 0) {
        return "Today";
    }

    if (diffInDays === 1) {
        return "Yesterday";
    }

    if (diffInDays < 5) {
        return formatDistanceToNow(createdDate, { addSuffix: true });
    }

    return format(createdDate, "LLL d");
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
    deleteNoteOptimistically: (id: string) => void;
}

export function Notes({
    notes,
    deleteNoteOptimistically,
}: NotesProps) {
    const groupedNotes = groupByDates(notes);

    const createDeleteNote = (id: string) => async () => {
        await deleteNote(id);
        deleteNoteOptimistically(id);
    };

    return (
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
                        <ItemDescription
                            className="whitespace-pre-wrap line-clamp-none"
                        >
                            { message }
                        </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                asChild
                            >
                                <Button
                                    variant="ghost"
                                    aria-label="Open menu"
                                    size="icon-sm"
                                >
                                    <MoreHorizontalIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <PenIcon />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-400"
                                    onClick={ createDeleteNote(id) }
                                >
                                    <TrashIcon
                                        className="text-red-400"
                                    />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </ItemActions>
                </Item>
            )) }
        </ul>
    );
};
