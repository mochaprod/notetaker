import { NoteTaker } from "@/components/pages/home/notetaker";
import { db } from "@/lib/db/db-instance";

export default async function Home() {
  const messages = await db.getNotes("default");

  return (
    <main
      className="container max-w-md mx-auto p-4"
    >
      <NoteTaker
        initialNotes={ messages }
      />
    </main>
  );
}
