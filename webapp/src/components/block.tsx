"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type BlockElement = keyof Pick<
    HTMLElementTagNameMap,
    "div" | "p" | "section" | "article" | "li" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
>;

export type BlockProps<T extends BlockElement = "div"> = {
    id: string;
    text: string;
    as?: T;
    className?: string;
    onInput: (id: string, value: string) => void;
    onEnter: (id: string) => void;
    onEmptyBackspace: (id: string) => void;
};

const normalizeText = (value: string) => value.replace(/\u00a0/g, " ");

export function Block({
    id,
    text,
    as = "div",
    className,
    onInput,
    onEnter,
    onEmptyBackspace,
}: BlockProps) {
    const Component = as;
    const localRef = useRef<HTMLElementTagNameMap[typeof Component] | null>(null);

    useEffect(() => {
        const element = localRef.current;
        if (!element) {
            return;
        }

        const currentText = normalizeText(element.innerText ?? "");
        if (currentText !== text) {
            element.innerText = text;
        }
    }, [text]);

    return (
        <Component
            ref={(element: HTMLElementTagNameMap[typeof Component] | null) => {
                localRef.current = element;
            }}
            contentEditable
            suppressContentEditableWarning
            data-block-id={id}
            data-placeholder="Start typing..."
            className={cn(
                "min-h-8 w-full whitespace-pre-wrap wrap-break-word bg-transparent text-lg leading-7 text-neutral-100 outline-none transition focus:text-white empty:before:text-neutral-600 empty:before:content-[attr(data-placeholder)]",
                className
            )}
            onInput={(event) => {
                onInput(id, normalizeText(event.currentTarget.innerText ?? ""));
            }}
            onPaste={(event) => {
                event.preventDefault();
                const pastedText = event.clipboardData.getData("text/plain");
                document.execCommand("insertText", false, pastedText);
            }}
            onKeyDown={(event) => {
                const currentText = normalizeText(event.currentTarget.innerText ?? "");

                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    onEnter(id);
                    return;
                }

                if (event.key === "Backspace" && currentText.length === 0) {
                    event.preventDefault();
                    onEmptyBackspace(id);
                }
            }}
        />
    );
}
