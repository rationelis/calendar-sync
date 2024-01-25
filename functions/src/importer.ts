import { Event } from "./models";

export abstract class EventImporter {
    abstract getEvents(): Promise<{ data: Event[] | null, error: string | null }>;
}
