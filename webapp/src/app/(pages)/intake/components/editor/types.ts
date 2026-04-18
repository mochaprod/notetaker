"use client";

import type { BaseEditor } from "slate";
import type { ReactEditor } from "slate-react";

export const LIST_TYPES = ["bulleted-list", "numbered-list"] as const;

export function isListType(type: string): boolean {
    return (LIST_TYPES as readonly string[]).includes(type);
}

export type CustomText = {
    text: string;
    bold?: true;
    italic?: true;
};

export type ParagraphElement = {
    type: "paragraph";
    children: CustomText[];
};

export type HeadingOneElement = {
    type: "heading-one";
    children: CustomText[];
};

export type HeadingTwoElement = {
    type: "heading-two";
    children: CustomText[];
};

export type BlockquoteElement = {
    type: "blockquote";
    children: CustomText[];
};

export type ListItemVariant = "default" | "heading-one" | "heading-two" | "blockquote";

export type ListItemElement = {
    type: "list-item";
    variant?: ListItemVariant;
    children: CustomText[];
};

export type BulletedListElement = {
    type: "bulleted-list";
    children: (ListItemElement | BulletedListElement)[];
};

export type NumberedListElement = {
    type: "numbered-list";
    children: (ListItemElement | NumberedListElement)[];
};

export type CustomElement =
    | ParagraphElement
    | HeadingOneElement
    | HeadingTwoElement
    | BlockquoteElement
    | ListItemElement
    | BulletedListElement
    | NumberedListElement;

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}
