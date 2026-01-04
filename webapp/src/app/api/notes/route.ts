import { auth } from "@/lib/auth";
import { noteRepository } from "@/lib/db/db-instance";
import { endOfDay, isAfter, startOfDay } from "date-fns";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({}, {
            status: 401,
            statusText: "Unauthorized",
        });
    }

    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");
    const userId = session.user.id;

    const dateParam = date ? new Date(date) : new Date();

    if (isAfter(dateParam, new Date())) {
        return NextResponse.json({}, {
            status: 400,
            statusText: "Invalid date",
        });
    }

    const start = startOfDay(dateParam);
    const end = endOfDay(dateParam);
    const notes = await noteRepository.getNotes(userId, start, end);

    return Response.json({
        notes,
    });
}
