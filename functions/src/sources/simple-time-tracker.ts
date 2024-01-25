import { EventImporter } from "../importer";
import { Event } from "../models";
import { convertToCsv, findFile, findFolder, getFile, initDrive } from "../utils/drive";

const EXPORT_FOLDER_NAME = 'stt_records';
const EXPORT_NAME = 'stt_records_automatic.csv';

export class SimpleTimeTrackerImporter implements EventImporter {
    constructor(private creds: string) { }

    async getEvents(): Promise<{ data: Event[] | null, error: string | null }> {
        const drive = await initDrive(this.creds);

        const folderId = await findFolder(drive, EXPORT_FOLDER_NAME);

        if (!folderId) {
            return {
                data: null,
                error: 'Folder not found',
            };
        }

        const fileId = await findFile(drive, folderId, EXPORT_NAME);

        if (!fileId) {
            return {
                data: null,
                error: 'File not found',
            };
        }

        const file = await getFile(drive, fileId);

        if (!file) {
            return {
                data: null,
                error: 'File not found',
            };
        }

        const csv = await convertToCsv(file);

        return {
            data: stringToEvent(csv),
            error: null,
        };
    }
}

export const stringToEvent = (input: string): Event[] => {
    const rows = input.split('\n');
    const headers = rows[0].split(',');
    const data = rows.slice(1).map((row) => {
        const values = row.split(',');
        const obj: any = {};
        headers.forEach((header, index) => {
            obj[header] = values[index];
        });
        return obj;
    });
    const result = data.map((unmapped) => {
        return {
            name: unmapped['activity name'],
            start: new Date(unmapped['time started']),
            end: new Date(unmapped['time ended'])
        }
    });
    return result;
}
