import { VertexAIService } from "@/lib/google-cloud/client";

export async function GET() {
    const service = new VertexAIService();
    console.log(await service.generateEmbeddings(["Need to go to dentist tomorrow."]));

    return Response.json({
    });
}
