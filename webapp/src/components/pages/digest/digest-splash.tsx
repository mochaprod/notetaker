import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function DigestSplash() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full h-screen flex flex-col gap-3 justify-center items-center"
        >
            <div
                className="relative"
            >
                <motion.div
                    animate={{
                        scale: [1.1, 1.75, 1.1],
                        opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 3,
                    }}
                    className="absolute inset-0 w-7 h-7 rounded-full bg-primary"
                />
                <Sparkles
                    className="w-7 h-7 z-10 relative"
                />
            </div>
            <div
                className="flex flex-col gap-3 justify-center items-center"
            >
                <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                        repeat: Infinity,
                        duration: 3,
                    }}
                >
                    <h1
                        className="text-2xl"
                    >
                        Thinking...
                    </h1>
                </motion.div>
                <div
                    className="text-muted-foreground text-sm"
                >
                    We're summarizing your day...
                </div>
            </div>
        </motion.div>
    );
}
