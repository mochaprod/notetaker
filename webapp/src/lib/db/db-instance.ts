import { prisma } from "@db/prisma";
import { PostgresqlNoteRepository } from "./postgresql/postgresql-db";

export const noteRepository = new PostgresqlNoteRepository(prisma);
