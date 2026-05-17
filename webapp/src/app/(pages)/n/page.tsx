import { withAuth } from "@/components/with-auth";
import { formatDate } from "@/lib/date";
import { redirect } from "next/navigation";

async function NotepadWorkspacePage() {
    redirect(`/n/date/${formatDate(new Date())}`);

    return null;
}

export default withAuth(NotepadWorkspacePage);
