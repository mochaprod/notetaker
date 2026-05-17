"use server";

import { auth } from "@/lib/auth";
import { notepadsRepository } from "@/lib/db/db-instance";
import { NotepadsCursorSchema, PaginatedNotepadsSchema } from "@common/types/intake";
import { headers } from "next/headers";
import { z } from "zod/v4";

const getNotepadsInputSchema = z.object({
    cursor: NotepadsCursorSchema.optional(),
}).optional();

export async function getNotepads(input?: unknown) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return PaginatedNotepadsSchema.parse({
            items: [],
            nextCursor: null,
        });
    }

    const parsedInput = getNotepadsInputSchema.parse(input);

    return await notepadsRepository.getNotepads(session.user.id, parsedInput);
}
