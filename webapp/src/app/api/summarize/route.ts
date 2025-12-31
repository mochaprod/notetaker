import { auth } from "@/lib/auth";
import { digestRepository, noteRepository } from "@/lib/db/db-instance";
import { Gemini } from "@/lib/llm/gemini";
import { LOGGER } from "@/lib/logger";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const dateKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({}, {
            status: 401,
        });
    }

    const startDate = request.nextUrl.searchParams.get("start");
    const endDate = request.nextUrl.searchParams.get("end");

    if (!startDate || !endDate || !dateKeyRegex.test(startDate) || !dateKeyRegex.test(endDate)) {
        LOGGER.error({ startDate, endDate }, "Invalid date range");

        return NextResponse.json({
            error: "Invalid date range",
        }, { status: 400 });
    }

    const userId = session.user.id;
    const existingSummary = await digestRepository.getSummary(userId, startDate, endDate);

    if (existingSummary) {
        LOGGER.info({ userId, startDate, endDate }, "Existing summary available.");
        return NextResponse.json(existingSummary);
    }

    try {
        const notes = await noteRepository.getNotes(session.user.id);

        const llm = new Gemini();
        const summary = await llm.summarize(notes);

        await digestRepository.putSummary(session.user.id, startDate, endDate, {
            ...summary,
            tasks: summary.tasks.map(({ datetime, ...others }) => ({
                ...others,
                datetime: datetime ? new Date(datetime) : null,
            })),
        });

        return NextResponse.json(summary);
    } catch (error) {
        LOGGER.error(error, "Failed to generate summary");
        return NextResponse.json({
            error: "Failed to generate summary",
        }, { status: 500 });
    }
}
