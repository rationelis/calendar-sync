export interface Event {
    name: string;
    start: string;
    end: string;
}

export abstract class EventImporter {
    abstract getEvents(): Promise<{ data: Event[] | null, error: string | null }>;
}
