import { withAuth } from "@/components/with-auth";
import { Aggregation } from "./components/aggregation";
import { IntakeTopBar } from "./components/intake-top-bar";
import { Notepad } from "./components/notepad";

async function IntakePage() {
    return (
        <div className="h-svh bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-100">
            <div className="grid h-full flex-1 grid-cols-10">
                <div className="col-span-7 flex h-full min-h-0 flex-col">
                    <IntakeTopBar />
                    <div className="min-h-0 flex-1">
                        <Notepad />
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
