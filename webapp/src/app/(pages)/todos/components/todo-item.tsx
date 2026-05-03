import { Badge } from "@/components/ui/badge";
import { Item, ItemContent, ItemDescription } from "@/components/ui/item";
import { formatDate } from "@/lib/date";
import { TodoData } from "@common/types/todo";
import clsx from "clsx";
import { CircleCheckIcon, CircleIcon } from "lucide-react";

export type TodoItemProps = {
    data: TodoData;
    setTodoStatus: (done: boolean) => void;
};

export function TodoItem({
    data,
    setTodoStatus,
}: TodoItemProps) {
    const { content, datetime, done } = data;
    return (
        <Item
            size="sm"
            variant="outline"
            className={ clsx(done && "bg-green-600/30") }
            onClick={ () => setTodoStatus(!done) }
        >
            <div>
                { done
                    ? (
                        <CircleCheckIcon
                            className="w-4 h-4 text-green-400"
                        />
                    )
                    : (
                        <CircleIcon
                            className="w-4 h-4 text-secondary"
                        />
                    )
                }
            </div>
            <ItemContent>
                <ItemDescription
                    className={ clsx(done && "text-green-100") }
                >
                    { content }
                </ItemDescription>
                { datetime && (
                    <div>
                        <Badge
                            variant={ done ? "done" : "secondary" }
                        >
                            { formatDate(datetime) }
                        </Badge>
                    </div>
                ) }
            </ItemContent>
        </Item>
    );
}
