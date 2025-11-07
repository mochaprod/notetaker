import { NoteTaker } from "@/components/pages/home/notetaker";
import { db } from "@/lib/db/db-instance";

export default async function Home() {
    const messages = await db.getNotes("default");

    return (
        <NoteTaker
          initialNotes={ messages }
        />
    );
}
