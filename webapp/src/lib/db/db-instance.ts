import { LowDBNoteRepository } from "./lowdb/lowdb-db";

export const noteRepository = new LowDBNoteRepository("./.db/db.json");
