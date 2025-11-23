import { IndexServiceClient, IndexEndpointServiceClient } from "@google-cloud/aiplatform";
import { ContentListUnion, GoogleGenAI } from "@google/genai";

export interface VertexAIServiceConfig {
    projectId?: string;
    location?: string;
}

export class VertexAIService {
    private readonly projectId: string;
    private readonly location: string;
    private readonly indexClient: IndexServiceClient;
    private readonly indexEndpointClient: IndexEndpointServiceClient;

    private readonly genai: GoogleGenAI;

    constructor(config: VertexAIServiceConfig = {}) {
        const projectId = config.projectId || process.env.GCP_PROJECT_ID;
        const location = config.location || process.env.GCP_LOCATION;

        if (!projectId || !location) {
            throw new Error("GCP_PROJECT_ID and GCP_LOCATION must be set in the environment or passed in the config.");
        }

        this.projectId = projectId;
        this.location = location;

        const clientOptions = {
            apiEndpoint: `${this.location}-aiplatform.googleapis.com`,
        };

        this.indexClient = new IndexServiceClient(clientOptions);
        this.indexEndpointClient = new IndexEndpointServiceClient(clientOptions);

        this.genai = new GoogleGenAI({});
    }

    private getLocationPath(): string {
        return this.indexClient.locationPath(this.projectId, this.location);
    }

    /**
     * Lists all indexes in the configured project and location.
     * @returns A promise that resolves to the list of indexes.
     */
    public async listIndexes() {
        const parent = this.getLocationPath();
        const [indexes] = await this.indexClient.listIndexes({ parent });
        return indexes;
    }

    // You can add more methods here to encapsulate other API calls
    // For example:
    //
    // public async getIndex(indexId: string) {
    //     const name = this.indexClient.indexPath(this.projectId, this.location, indexId);
    //     const [index] = await this.indexClient.getIndex({ name });
    //     return index;
    // }

    public async generateEmbeddings(contents: ContentListUnion) {
        const response = await this.genai.models.embedContent({
            model: "gemini-embedding-001",
            contents,
        });

        return response.embeddings;
    }

    public async storeEmbeddings({ id, embedding }: { id: string, embedding: number[] }) {
        const indexName = this.indexClient.indexPath(this.projectId, this.location, "4808025809799348224");

        await this.indexClient.upsertDatapoints({
            index: indexName,
            datapoints: [
                {
                    datapointId: id,
                    featureVector: embedding,
                },
            ],
        });
    }
}
