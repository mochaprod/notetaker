"use client";

import { type PropsWithChildren } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AggregationCardProps = PropsWithChildren<{
    title: string;
    className?: string;
}>;

export function AggregationCard({
    title,
    className,
    children,
}: AggregationCardProps) {
    return (
        <Card className={cn("border-border/70 bg-card/90 shadow-none py-4 gap-3", className)}>
            <CardHeader className="px-4">
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
                {children}
            </CardContent>
        </Card>
    );
}
