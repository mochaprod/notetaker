import { z } from "zod/v4";

export const SlateTextSchema = z.object({
    text: z.string(),
    bold: z.literal(true).optional(),
    italic: z.literal(true).optional(),
});

export type SlateText = z.infer<typeof SlateTextSchema>;

const baseTextChildren = {
    children: z.array(SlateTextSchema),
};

export const SlateListItemVariantSchema = z.enum([
    "default",
    "heading-one",
    "heading-two",
    "heading-three",
    "heading-four",
    "heading-five",
    "heading-six",
    "blockquote",
]);

export type SlateElement = {
    type:
        | "paragraph"
        | "heading-one"
        | "heading-two"
        | "heading-three"
        | "heading-four"
        | "heading-five"
        | "heading-six"
        | "blockquote"
        | "list-item"
        | "bulleted-list"
        | "numbered-list";
    variant?: z.infer<typeof SlateListItemVariantSchema>;
    children: SlateText[] | SlateElement[];
};

export const SlateElementSchema: z.ZodType<SlateElement> = z.lazy(() => z.discriminatedUnion("type", [
    z.object({
        type: z.literal("paragraph"),
        ...baseTextChildren,
    }),
    z.object({
        type: z.literal("heading-one"),
        ...baseTextChildren,
    }),
    z.object({
        type: z.literal("heading-two"),
        ...baseTextChildren,
    }),
    z.object({
        type: z.literal("heading-three"),
        ...baseTextChildren,
    }),
    z.object({
        type: z.literal("heading-four"),
        ...baseTextChildren,
    }),
    z.object({
        type: z.literal("heading-five"),
        ...baseTextChildren,
    }),
    z.object({
        type: z.literal("heading-six"),
        ...baseTextChildren,
    }),
    z.object({
        type: z.literal("blockquote"),
        ...baseTextChildren,
    }),
    z.object({
        type: z.literal("list-item"),
        variant: SlateListItemVariantSchema.optional(),
        ...baseTextChildren,
    }),
    z.object({
        type: z.literal("bulleted-list"),
        children: z.array(SlateElementSchema),
    }),
    z.object({
        type: z.literal("numbered-list"),
        children: z.array(SlateElementSchema),
    }),
]));

export const SlateDocumentSchema = z.array(SlateElementSchema).min(1);

export type SlateDocument = z.infer<typeof SlateDocumentSchema>;

export const PersistedNotepadDocumentSchema = z.object({
    id: z.string().nullable(),
    title: z.string(),
    content: SlateDocumentSchema,
    createdAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date().nullable(),
});

export type PersistedNotepadDocument = z.infer<typeof PersistedNotepadDocumentSchema>;

export const DailyNotepadDocumentSchema = PersistedNotepadDocumentSchema.extend({
    dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type DailyNotepadDocument = z.infer<typeof DailyNotepadDocumentSchema>;

export const NotepadDocumentSchema = PersistedNotepadDocumentSchema.extend({
    dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export type NotepadDocument = z.infer<typeof NotepadDocumentSchema>;

export const SaveNotepadDocumentSchema = DailyNotepadDocumentSchema.pick({
    dateKey: true,
    title: true,
    content: true,
});

export type SaveNotepadDocument = z.infer<typeof SaveNotepadDocumentSchema>;

export const SaveNotepadByIdDocumentSchema = PersistedNotepadDocumentSchema.pick({
    title: true,
    content: true,
}).extend({
    notepadId: z.string().min(1),
});

export type SaveNotepadByIdDocument = z.infer<typeof SaveNotepadByIdDocumentSchema>;
