import { auth } from "@/lib/auth";
import { digestRepository, noteRepository } from "@/lib/db/db-instance";
import { Gemini } from "@/lib/llm/gemini";
import { formatDate } from "@/lib/llm/tools";
import { LOGGER } from "@/lib/logger";
import { isSameDay } from "date-fns";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const startEndDateSchema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
});
const llm = new Gemini();

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json(
            {},
            {
                status: 401,
            }
        );
    }

    const startDateStr = request.nextUrl.searchParams.get("start");
    const endDateStr = request.nextUrl.searchParams.get("end");
    const params = startEndDateSchema.safeParse({
        start: startDateStr,
        end: endDateStr,
    });
    const userId = session.user.id;

    if (
        !params.success || !isSameDay(params.data.start, params.data.end)
    ) {
        LOGGER.error({ userId, startDateStr, endDateStr }, "Could not parse date range");

        return NextResponse.json(
            {
                error: "Invalid date range",
            },
            { status: 400 }
        );
    }

    const { start: startDate, end: endDate } = params.data;
    const startDateKey = formatDate(startDate);
    const endDateKey = formatDate(endDate);

    const existingSummary = await digestRepository.getSummary(
        userId,
        startDateKey,
        endDateKey,
    );

    const DATE_LOGGER = LOGGER.child({
        userId,
        startDate: params.data.start,
        endDate: params.data.end,
    });

    if (existingSummary) {
        DATE_LOGGER.debug("Existing summary available.");
        return NextResponse.json(existingSummary);
    }

    try {
        const notes = await noteRepository.getNotes(
            session.user.id,
            startDate,
            endDate
        );

        if (notes?.length === 0) {
            DATE_LOGGER.debug("No notes found. Skipping summarization");
            return NextResponse.json({
                error: "No notes found",
            }, {
                status: 409,
            });
        }

        const rawSummary = await llm.summarize(notes);
        const summary = await digestRepository.putSummary(
            session.user.id,
            startDateKey,
            endDateKey,
            {
                ...rawSummary,
                tasks: rawSummary.tasks.map(({ datetime, ...others }) => ({
                    ...others,
                    datetime: datetime ? new Date(datetime) : null,
                })),
            }
        );

        return NextResponse.json(summary);
    } catch (error) {
        LOGGER.error(error, "Failed to generate summary");
        return NextResponse.json(
            {
                error: "Failed to generate summary",
            },
            { status: 500 }
        );
    }
}
