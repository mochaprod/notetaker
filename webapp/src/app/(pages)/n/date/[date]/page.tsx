import { withAuth } from "@/components/with-auth";
import { notFound } from "next/navigation";
import { Workspace } from "../../components/workspace";

type IntakeDatePageProps = {
    params: Promise<{
        date: string;
    }>;
};

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

async function IntakeDatePage({ params }: IntakeDatePageProps) {
    const { date } = await params;

    if (!dateKeyPattern.test(date)) {
        notFound();
    }

    return (
        <Workspace
            notepadReference={{
                kind: "date",
                dateKey: date,
            }}
        />
    );
}

export default withAuth(IntakeDatePage);
