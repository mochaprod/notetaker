import { withAuth } from "@/components/with-auth";
import { Aggregation } from "./components/aggregation";
import { Notepad } from "./components/notepad";

async function IntakePage() {
    return (
        <div className="h-svh bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-100">
            <div className="grid h-full flex-1 grid-cols-10">
                <div className="col-span-6">
                    <Notepad />
                </div>
                <div className="col-span-4">
                    <Aggregation />
                </div>
            </div>
        </div>
    );
}

export default withAuth(IntakePage);
