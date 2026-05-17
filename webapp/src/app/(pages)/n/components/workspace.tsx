import { Aggregation } from "./aggregation";
import { NotepadPanel } from "./notepad-panel";
import type { NotepadReference } from "./notepad-reference";
import { TopBar } from "./top-bar/top-bar";

type WorkspaceProps = {
    notepadReference: NotepadReference;
};

export function Workspace({ notepadReference }: WorkspaceProps) {
    return (
        <div className="w-full h-svh bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-100">
            <div className="grid h-full flex-1 grid-cols-10">
                <div className="col-span-7 flex h-full min-h-0 flex-col">
                    <TopBar notepadReference={ notepadReference } />
                    <div className="min-h-0 flex-1">
                        <NotepadPanel notepadReference={ notepadReference } />
                    </div>
                </div>
                <div className="col-span-3">
                    <Aggregation />
                </div>
            </div>
        </div>
    );
}
