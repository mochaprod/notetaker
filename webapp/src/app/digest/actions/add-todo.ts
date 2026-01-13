"use server";

import { auth } from "@/lib/auth";
import { todoRepository } from "@/lib/db/db-instance";
import { Todo } from "@common/types/todo";
import { headers } from "next/headers";

export async function addTodo(data: Todo) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Not authenticated");
    }

    await todoRepository.addTodo(session.user.id, data);
}
