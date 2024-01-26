import { drive_v3, google } from "googleapis";

export const initDrive = (creds: any): drive_v3.Drive => {
	return google.drive({
		version: "v3",
		auth: new google.auth.GoogleAuth({
			credentials: creds,
			scopes: ["https://www.googleapis.com/auth/drive"],
		}),
	});
};

export const findFolders = async (drive: drive_v3.Drive, folderName: string): Promise<{ id: string, error: string | null }> => {
	let folders = null;
	try {
		folders = await drive.files.list();
	} catch (err: any) {
		return { id: "", error: err.message };
	}

	if (!folders || !folders.data || !folders.data.files) {
		return { id: "", error: "No folders" };
	}

	const folder = folders.data.files.find((file) => file.name === folderName);

	if (!folder || !folder.id) {
		return { id: "", error: "Folder not found" };
	}

	return { id: folder.id, error: null };
};

export const findFile = async (drive: drive_v3.Drive, folderId: string, fileName: string): Promise<{ id: string, error: string | null }> => {
	let files = null;
	try {
		files = await drive.files.list({
			q: `'${folderId}' in parents`,
			fields: "files(id, name)",
		});
	} catch (err: any) {
		return { id: "", error: err.message };
	}

	if (!files || !files.data || !files.data.files) {
		return { id: "", error: "No files" };
	}

	const file = files.data.files.find((file) => file.name === fileName);

	if (!file || !file.id) {
		return { id: "", error: "File not found" };
	}

	return { id: file.id, error: null };
};

export const getFile = async (drive: drive_v3.Drive, fileId: string): Promise<{	data: string | null, error: string | null }> => {
	let response = null;
	try {
		response = await drive.files.get({
			fileId,
			alt: "media",
		});
	} catch (err: any) {
		return { data: null, error: err.message };
	}

	if (!response || !response.data) {
		return { data: null, error: "No response" };
	}

	let data = null;
	try {
		data = await (response.data as unknown as Blob).text();
	} catch (err: any) {
		return { data: null, error: err.message };
	}

	return { data, error: null };
};
