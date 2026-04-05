import { Aggregation } from "./components/aggregation";
import { IntakeProvider } from "./components/intake-provider";
import { Notepad } from "./components/notepad";

export default async function IntakePage() {
    return (
        <IntakeProvider>
            <div className="h-svh text-neutral-100">
                <div className="grid h-full flex-1 grid-cols-10">
                    <div className="col-span-6">
                        <Notepad />
                    </div>
                    <div className="col-span-4">
                        <Aggregation />
                    </div>
                </div>
            </div>
        </IntakeProvider>
    );
}
