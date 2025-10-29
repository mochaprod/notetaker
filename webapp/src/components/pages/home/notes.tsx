import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Note } from "@/lib/db/db";
import { differenceInMinutes, format, formatDistanceToNow } from "date-fns";

function getTimeToDisplay(createdDate: Date): string {
    const now = new Date();
    const diffInMins = differenceInMinutes(now, createdDate);

    return diffInMins > 30
        ? format(createdDate, "LLL d, y hh:mma")
        : formatDistanceToNow(createdDate, { addSuffix: true });
}

export interface NotesProps {
    notes?: Note[];
}

export function Notes({ notes }: NotesProps) {
    return (
        <div
            className="flex flex-col gap-1"
        >
            { notes?.map(msg => (
                <Item
                    key={ msg.id }
                    variant="outline"
                >
                    <ItemContent>
                        <ItemTitle>
                            { msg.message }
                        </ItemTitle>
                        <ItemDescription>
                            { getTimeToDisplay(new Date(msg.createdAt)) }
                        </ItemDescription>
                    </ItemContent>
                </Item>
            )) }
        </div>
    );
};
