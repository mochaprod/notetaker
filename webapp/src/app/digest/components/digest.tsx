"use client";

import { Container } from "@/components/custom/container";
import { QueryParamsDateSelector } from "@/components/custom/query-params-date-selector";
import { Badge } from "@/components/ui/badge";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components/ui/item";
import { useSearchParamsDate } from "@/hooks/use-search-params-date";
import { Summary, SummarySchema } from "@common/types/summary";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, format, startOfDay } from "date-fns";
import { WandSparklesIcon } from "lucide-react";
import { AnimatePresence, motion, stagger } from "motion/react";
import { useMemo } from "react";
import { ActionMenu } from "./action-menu";
import { DigestSplash } from "./digest-splash";

const containerAnimations = {
    hidden: {
        opacity: 0,
    },
    show: {
        opacity: 1,
        transition: {
            delay: 0.1,
            delayChildren: stagger(0.125),
        },
    },
};

const childAnimations = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    show: {
        opacity: 1,
        y: 0,
    },
};

export function Digest() {
    const [currentDate, currentDateStr] = useSearchParamsDate();
    const summary = useQuery<Summary>({
        queryKey: ["summary", currentDateStr],
        queryFn: async () => {
            const params = new URLSearchParams({
                start: startOfDay(currentDate).toISOString(),
                end: endOfDay(currentDate).toISOString(),
            });
            const response = await fetch(`/api/summarize?${params.toString()}`);
            const data = await response.json();

            return SummarySchema.parseAsync(data);
        },
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchInterval: false,
        retry: false,
    });

    const renderSummary = useMemo(
        () =>
            summary.data && summary.data.tasks ? (
                <div className="flex flex-col gap-6">
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-2 bg-primary/30 rounded-lg px-3.5 py-3"
                    >
                        <h2 className="flex gap-1 items-center text-xs font-semibold uppercase">
                            <WandSparklesIcon className="w-4 h-4" />
                            Summary
                        </h2>
                        <p className="leading-loose">{summary.data?.summary}</p>
                    </motion.section>
                    <section className="flex flex-col gap-3">
                        <h2 className="text-xl font-semibold">
                            Action Items
                        </h2>
                        <motion.ul
                            variants={containerAnimations}
                            initial="hidden"
                            animate="show"
                            className="flex flex-col gap-2"
                        >
                            {summary.data?.tasks.map((task, i) => (
                                <motion.li key={i} variants={childAnimations}>
                                    <Item variant="outline" size="sm">
                                        <ItemContent>
                                            <ItemTitle>
                                                {task.content}
                                            </ItemTitle>
                                            {task.theme && (
                                                <ItemDescription className="flex gap-1">
                                                    <Badge>{task.theme}</Badge>
                                                    {task.datetime && (
                                                        <Badge>
                                                            {format(
                                                                task.datetime,
                                                                "LLL d"
                                                            )}
                                                        </Badge>
                                                    )}
                                                </ItemDescription>
                                            )}
                                        </ItemContent>
                                        <ItemActions className="flex-col">
                                            <ActionMenu
                                                task={ task }
                                            />
                                        </ItemActions>
                                    </Item>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </section>
                </div>
            ) : (
                <div className="flex justify-center items-center h-62.5 max-h-dvh">
                    No summary available.
                </div>
            ),
        [summary.data, summary.data?.tasks]
    );

    return (
        <Container>
            <motion.div key="content" className="flex flex-col gap-4">
                <QueryParamsDateSelector />
                <AnimatePresence mode="wait">
                    {summary.isLoading ? (
                        <DigestSplash key="splash" />
                    ) : renderSummary}
                </AnimatePresence>
            </motion.div>
        </Container>
    );
}
