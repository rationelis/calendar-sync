import { drive_v3, google } from 'googleapis';

export const initDrive = async (creds: any): Promise<drive_v3.Drive> => {
    return google.drive({
        version: 'v3',
        auth: new google.auth.GoogleAuth({
            credentials: creds,
            scopes: ['https://www.googleapis.com/auth/drive'],
        }),
    });
}

export const findFolder = async (drive: drive_v3.Drive, folderName: string): Promise<string | null> => {
    const folder = await drive.files.list();
    return folder.data.files?.find((file) => file.name === folderName)?.id || null;
}

export const findFile = async (drive: drive_v3.Drive, folderId: string, fileName: string): Promise<string | null> => {
    const files = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name)',
    });
    return files.data.files?.find((file) => file.name === fileName)?.id || null;
}

export const getFile = async (drive: drive_v3.Drive, fileId: string): Promise<drive_v3.Schema$File | null> => {
    const response = await drive.files.get({
        fileId,
        alt: 'media',
    });
    return response.data;
}

export const convertToCsv = async (file: drive_v3.Schema$File): Promise<string> => {
    const arrayBuffer = await (file as unknown as Blob).arrayBuffer();
    const bufferData = Buffer.from(arrayBuffer);
    return bufferData.toString('utf-8');
}
