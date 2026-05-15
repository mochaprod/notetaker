import { withAuth } from "@/components/with-auth";
import { Aggregation } from "./components/aggregation";
import { TopBar } from "./components/top-bar/top-bar";
import { NotepadPanel } from "./components/notepad-panel";

async function IntakePage() {
    return (
        <div className="h-svh bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-100">
            <div className="grid h-full flex-1 grid-cols-10">
                <div className="col-span-7 flex h-full min-h-0 flex-col">
                    <TopBar />
                    <div className="min-h-0 flex-1">
                        <NotepadPanel />
                    </div>
                </div>
                <div className="col-span-3">
                    <Aggregation />
                </div>
            </div>
        </div>
    );
}

export default withAuth(IntakePage);
