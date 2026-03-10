"use server";

import { auth } from "@/lib/auth";
import { todoRepository } from "@/lib/db/db-instance";
import { headers } from "next/headers";

export async function getTodos() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        return [];
    }

    return await todoRepository.getTodos(session.user.id);
}

export async function setTodoStatus(todoId: string, done: boolean) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        return;
    }

    return await todoRepository.setTodoStatus(
        session.user.id,
        todoId,
        done,
    );
}
