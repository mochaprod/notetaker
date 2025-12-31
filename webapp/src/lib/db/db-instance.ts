import { prisma } from "@db/prisma";
import { PostgresqlNoteRepository } from "./postgresql/postgresql-db";
import { PostgresqlDigestRepository } from "./postgresql/summary-repo";

export const noteRepository = new PostgresqlNoteRepository(prisma);
export const digestRepository = new PostgresqlDigestRepository(prisma);
