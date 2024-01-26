import { EventImporter } from "../types";
import { Event } from "../types";
import { findFile, findFolders, getFile, initDrive } from "../helpers/drive";

const EXPORT_FOLDER_NAME = "stt_records";
const EXPORT_NAME = "stt_records_automatic.csv";

export class SimpleTimeTrackerImporter implements EventImporter {
	constructor(private creds: string) {}

	async getEvents(): Promise<{ data: Event[] | null; error: string | null }> {
		const drive = initDrive(this.creds);

		if (!drive) {
			return { data: null, error: "Could not initialize drive" };
		}

		const { id: folderID, error: findFoldersError } = await findFolders(drive, EXPORT_FOLDER_NAME);

		if (findFoldersError) {
			return { data: null, error: findFoldersError };
		}

		const { id: fileId, error: findFileError } = await findFile(drive, folderID, EXPORT_NAME);

		if (findFileError) {
			return { data: null, error: findFileError };
		}

		const { data, error: getFileError } = await getFile(drive, fileId);

		if (getFileError) {
			return { data: null, error: getFileError };
		}

		if (!data) {
			return { data: null, error: "No data" };
		}
		
		return { data: this.parseData(data), error: null };
	}

	parseData = (input: string): Event[] => {
		const rows = input.split("\n");
		const headers = rows[0].split(",");
		const data = rows.slice(1).map((row) => {
			const values = row.split(",");
			const obj: any = {};
			headers.forEach((header, index) => {
				obj[header] = values[index];
			});
			return obj;
		});
		const result = data.map((unmapped) => {
			return {
				name: unmapped["activity name"].replace(/"/g, ""),
				start: unmapped["time started"],
				end: unmapped["time ended"],
			};
		});
		return result;
	};
}
