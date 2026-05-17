"use client";

import { Container } from "@/components/custom/container";
import { Button } from "@/components/ui/button";
import { formatRelativeDateTime } from "@/lib/utils";
import type { NotepadsCursor } from "@common/types/intake";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getNotepads } from "../actions/get-notepads";
import { Separator } from "@/components/ui/separator";

const NOTEPADS_QUERY_KEY = ["notepads"];

export function NotepadsList() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending,
    } = useInfiniteQuery({
        queryKey: NOTEPADS_QUERY_KEY,
        queryFn: ({ pageParam }) => getNotepads(pageParam ? { cursor: pageParam } : undefined),
        initialPageParam: null as NotepadsCursor | null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
    const notepads = data?.pages.flatMap((page) => page.items) ?? [];

    return (
        <Container className="w-full gap-12">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">
                    Notepads
                </h1>
                <Button asChild>
                    <Link href="/intake">
                        New daily note
                    </Link>
                </Button>
            </div>
            <div className="flex flex-col gap-3">
                { isPending ? (
                    <p className="text-sm text-muted-foreground">
                        Loading notepads...
                    </p>
                ) : null }
                { !isPending && notepads.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No notepads yet.
                    </p>
                ) : null }
                { notepads.map((notepad, i) => (
                    <>
                        <Link
                            key={ notepad.id }
                            href={`/intake/notepad/${notepad.id}`}
                            className="rounded-md transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="truncate text-base font-semibold text-neutral-950 dark:text-neutral-100">
                                        { notepad.title }
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Created { formatRelativeDateTime(new Date(notepad.createdAt), true) }
                                    </p>
                                </div>
                                { notepad.dateKey ? (
                                    <span>
                                        { notepad.dateKey }
                                    </span>
                                ) : null }
                            </div>
                        </Link>
                        { i !== notepads.length - 1 && (
                            <Separator />
                        ) }
                    </>
                )) }
            </div>
            { hasNextPage ? (
                <Button
                    type="button"
                    variant="outline"
                    disabled={ isFetchingNextPage }
                    onClick={ () => void fetchNextPage() }
                >
                    { isFetchingNextPage ? "Loading..." : "Load more" }
                </Button>
            ) : null }
        </Container>
    );
}
