import { Button } from "@/components/ui/button";
import { IconSparkles } from "@tabler/icons-react";

export interface SummarizerProps {
    summarize: () => Promise<void>;
}

export function Summarizer({ summarize }: SummarizerProps) {
    return (
        <Button type="button"
            onClick={ summarize }
        >
            <IconSparkles />
            Summarize
        </Button>
    );
}
