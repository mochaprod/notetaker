import { withAuth } from "@/components/with-auth";
import { NotepadsList } from "./components/notepads-list";

async function NotepadsPage() {
    return (
        <div
            className="w-full"
        >
            <NotepadsList />
        </div>
    );
}

export default withAuth(NotepadsPage);
