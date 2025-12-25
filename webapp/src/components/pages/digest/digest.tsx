"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SummaryResponse, SummaryResponseSchema } from "@/lib/llm/llm";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, SendHorizonalIcon, StarIcon, WandSparklesIcon } from "lucide-react";
import { AnimatePresence, motion, stagger } from "motion/react";
import { DigestSplash } from "./digest-splash";

import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
    const summary = useQuery<SummaryResponse>({
        queryKey: ["summary"],
        queryFn: async () => {
            const response = await fetch("/api/summarize");
            const data = await response.json();

            return SummaryResponseSchema.parseAsync(data);
        },
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchInterval: false,
        retry: false,
    });

    return (
        <main
            key="summary"
            className="max-w-md w-full mx-auto"
        >
            <AnimatePresence
                mode="wait"
            >
                { summary.isLoading
                    ? (
                        <DigestSplash
                            key="splash"
                        />
                    )
                    : (
                        <motion.div
                            key="content"
                            className="flex flex-col gap-4"
                        >
                            <h1
                                className="text-4xl font-mono font-bold"
                            >
                                Daily Summary
                            </h1>
                            <div
                                className="flex flex-col gap-6"
                            >
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-col gap-2 bg-primary/30 rounded-lg px-3.5 py-3"
                                >
                                    <h2
                                        className="flex gap-1 items-center text-xs font-semibold uppercase"
                                    >
                                        <WandSparklesIcon
                                            className="w-4 h-4"
                                        />
                                        Summary
                                    </h2>
                                    <p
                                        className="leading-loose"
                                    >
                                        { summary.data?.summary }
                                    </p>
                                </motion.section>
                                <section
                                    className="flex flex-col gap-3"
                                >
                                    <h2
                                        className="text-xl font-semibold"
                                    >
                                        Suggested Action Items
                                    </h2>
                                    <motion.ul
                                        variants={ containerAnimations }
                                        initial="hidden"
                                        animate="show"
                                        className="flex flex-col gap-2"
                                    >
                                        { summary.data?.tasks.map((task, i) => (
                                            <motion.li
                                                key={ i }
                                                variants={ childAnimations }
                                            >
                                                <Item
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <ItemContent>
                                                        <ItemTitle>
                                                            { task.content }
                                                        </ItemTitle>
                                                        { task.theme && (
                                                            <ItemDescription
                                                                className="flex gap-1"
                                                            >
                                                                <Badge>
                                                                    { task.theme }
                                                                </Badge>
                                                                { task.datetime && (
                                                                    <Badge>
                                                                        { format(new Date(task.datetime), "LLL d") }
                                                                    </Badge>
                                                                ) }
                                                            </ItemDescription>
                                                        ) }
                                                    </ItemContent>
                                                    <ItemActions
                                                        className="flex-col"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="icon-sm"
                                                        >
                                                            <StarIcon />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon-sm"
                                                        >
                                                            <PlusIcon />
                                                        </Button>
                                                    </ItemActions>
                                                </Item>
                                            </motion.li>
                                        )) }
                                    </motion.ul>
                                </section>
                            </div>
                            <div
                                className="flex gap-1"
                            >
                                <Input
                                    placeholder="Ask your notes"
                                />
                                <Button
                                    className="grow-0 self-end"
                                >
                                    <SendHorizonalIcon />
                                </Button>
                            </div>
                        </motion.div>
                    ) }
            </AnimatePresence>
        </main>
    );
}
