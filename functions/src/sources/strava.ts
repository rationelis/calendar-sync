import { EventImporter } from "../importer";

export class StravaImporter implements EventImporter {
    async getEvents(): Promise<{ data: any, error: string | null }> {
        const data = {};
        return { data, error: null };
    }
}
