import { prisma } from "@db/prisma";
import { PostgresqlNoteRepository } from "./postgresql/postgresql-db";
import { PostgresqlDigestRepository } from "./postgresql/summary-repo";
import { PostgresqlTodoRepository } from "./postgresql/todo-repo";
import { PostgresqlUserRepository } from "./postgresql/user-repo";

export const userRepository = new PostgresqlUserRepository(prisma);
export const noteRepository = new PostgresqlNoteRepository(prisma);
export const digestRepository = new PostgresqlDigestRepository(prisma);
export const todoRepository = new PostgresqlTodoRepository(prisma);
