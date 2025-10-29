"use server";

import { Note } from "@/lib/db/db";
import { db } from "@/lib/db/db-instance";

export async function storeText(data: string): Promise<Note | null> {
    if (!data || data.trim().length === 0) {
        return null;
    }

    return db.putNotes("default", data.trim());
}
