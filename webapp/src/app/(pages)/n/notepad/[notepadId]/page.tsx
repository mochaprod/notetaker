import { withAuth } from "@/components/with-auth";
import { Workspace } from "../../components/workspace";

type IntakeNotepadPageProps = {
    params: Promise<{
        notepadId: string;
    }>;
};

async function IntakeNotepadPage({ params }: IntakeNotepadPageProps) {
    const { notepadId } = await params;

    return (
        <Workspace
            notepadReference={{
                kind: "notepad",
                notepadId,
            }}
        />
    );
}

export default withAuth(IntakeNotepadPage);
