"use client";

import { format } from "date-fns";
import {
    createContext,
    type PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

export type IntakeBlock = {
    id: string;
    text: string;
};

type IntakeContextValue = {
    blocks: IntakeBlock[];
    todayLabel: string;
    summaryVersion: number;
    getBlockText: (id: string, fallbackText?: string) => string;
    handleInput: (id: string, value: string) => void;
    insertBlockAfter: (id: string) => void;
    removeBlock: (id: string) => void;
    summarizeLine: (text: string) => string;
};

const initialBlocks: IntakeBlock[] = [
    {
        id: "block-1",
        text: "Morning standup notes: blocked on auth tests, need schema update.",
    },
    {
        id: "block-2",
        text: "Ideas: summarize notes by day, show actionable tasks with dates.",
    },
    {
        id: "block-3",
        text: "Follow up with design on sidebar layout for notes and digest.",
    },
];

const IntakeContext = createContext<IntakeContextValue | null>(null);

const summarizeLine = (text: string) => {
    if (!text.trim()) {
        return "Empty line. Add a note to generate a summary.";
    }
    const trimmed = text.trim();
    if (trimmed.length <= 120) {
        return trimmed;
    }
    return `${trimmed.slice(0, 120)}…`;
};

export function IntakeProvider({ children }: PropsWithChildren) {
    const [blocks, setBlocks] = useState<IntakeBlock[]>(initialBlocks);
    const [focusId, setFocusId] = useState<string | null>(null);
    const [summaryVersion, setSummaryVersion] = useState(0);
    const blockTextRef = useRef<Record<string, string>>({});
    const todayLabel = format(new Date(), "EEEE, MMMM d");

    useEffect(() => {
        initialBlocks.forEach((block) => {
            blockTextRef.current[block.id] = block.text;
        });
    }, []);

    useEffect(() => {
        if (focusId) {
            const el = document.querySelector<HTMLElement>(`[data-block-id="${focusId}"]`);

            if (!el) {
                return;
            }

            requestAnimationFrame(() => {
                el?.focus();
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(el!);
                range.collapse(false);
                selection?.removeAllRanges();
                selection?.addRange(range);
            });
            setFocusId(null);
        }
    }, [focusId]);

    const handleInput = (id: string, value: string) => {
        blockTextRef.current[id] = value;
        setSummaryVersion((current) => current + 1);
    };

    const insertBlockAfter = (id: string) => {
        setBlocks((current) => {
            const index = current.findIndex((block) => block.id === id);
            const newBlock: IntakeBlock = {
                id: `block-${Date.now()}`,
                text: "",
            };
            blockTextRef.current[newBlock.id] = "";
            const next = [...current];
            next.splice(index + 1, 0, newBlock);
            setFocusId(newBlock.id);
            return next;
        });
    };

    const removeBlock = (id: string) => {
        setBlocks((current) => {
            if (current.length <= 1) {
                return current;
            }
            const index = current.findIndex((block) => block.id === id);
            const next = current.filter((block) => block.id !== id);
            delete blockTextRef.current[id];
            const focusTarget = next[Math.max(0, index - 1)];
            setFocusId(focusTarget?.id ?? null);
            return next;
        });
    };

    const value = useMemo<IntakeContextValue>(() => ({
        blocks,
        todayLabel,
        summaryVersion,
        getBlockText: (id: string, fallbackText = "") =>
            blockTextRef.current[id] ?? fallbackText,
        handleInput,
        insertBlockAfter,
        removeBlock,
        summarizeLine,
    }), [blocks, summaryVersion, todayLabel]);

    return (
        <IntakeContext.Provider value={value}>
            {children}
        </IntakeContext.Provider>
    );
}

export function useIntake() {
    const context = useContext(IntakeContext);

    if (!context) {
        throw new Error("useIntake must be used within an IntakeProvider.");
    }

    return context;
}
