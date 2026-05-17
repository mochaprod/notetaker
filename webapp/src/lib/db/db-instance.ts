import { prisma } from "@db/prisma";
import { PostgresqlNoteRepository } from "./postgresql/postgresql-db";
import { PostgresqlDigestRepository } from "./postgresql/summary-repo";
import { PostgresqlNotepadRepository } from "./postgresql/notepad-repo";
import { PostgresqlNotepadsRepository } from "./postgresql/notepads-repo";
import { PostgresqlTodoRepository } from "./postgresql/todo-repo";
import { PostgresqlUserRepository } from "./postgresql/user-repo";

export const userRepository = new PostgresqlUserRepository(prisma);
export const noteRepository = new PostgresqlNoteRepository(prisma);
export const digestRepository = new PostgresqlDigestRepository(prisma);
export const todoRepository = new PostgresqlTodoRepository(prisma);
export const notepadRepository = new PostgresqlNotepadRepository(prisma);
export const notepadsRepository = new PostgresqlNotepadsRepository(prisma);
