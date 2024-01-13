import { google } from 'googleapis';
import { stringToSpreadsheetRow } from './models';

const EXPORT_NAME = 'stt_records_automatic.csv';

export const getSpreadsheet = async (creds: any): Promise<{ data: any, error: string | null }> => {
    const drive = google.drive({
        version: 'v3',
        auth: new google.auth.GoogleAuth({
            credentials: creds,
            scopes: ['https://www.googleapis.com/auth/drive'],
        }),
    });

    const folder = await drive.files.list();

    const folderId = folder.data.files?.find((file) => file.name === 'stt_records')?.id;

    if (!folderId) {
        return { data: null, error: 'Folder ID not found' };
    }

    const files = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name)',
    });

    if (!files || !files.data || !files.data.files) {
        return { data: null, error: 'No files found' };
    }

    if (files.data.files.length === 0) {
        return { data: null, error: 'No matching files found' };
    }

    const fileId = files.data.files.find((file) => file.name === EXPORT_NAME)?.id;

    if (!fileId) {
        return { data: null, error: 'File ID not found' };
    }

    const response = await drive.files.get({
        fileId,
        alt: 'media',
    });

    const arrayBuffer = await (response.data as unknown as Blob).arrayBuffer();

    const bufferData = Buffer.from(arrayBuffer);

    const csvString = bufferData.toString('utf-8');

    return { data: stringToSpreadsheetRow(csvString), error: null };
}