import { noteRepository } from "@/lib/db/db-instance";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");

    const dateParam = date ? new Date(date) : new Date();
    const notes = await noteRepository.getNotes("default", dateParam);

    return Response.json({
        notes,
    });
}
