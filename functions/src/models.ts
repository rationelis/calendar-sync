export interface SpreadsheetRow {
    activityName: string;
    timeStarted: string;
    timeEnded: string;
    comment: string;
    categories: string;
    recordTags: string;
    duration: string;
    durationMinutes: string;
}

export const stringToSpreadsheetRow = (row: string): SpreadsheetRow[] => {
    const rows = row.split('\n');
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
            activityName: unmapped['activity name'],
            timeStarted: unmapped['time started'],
            timeEnded: unmapped['time ended'],
            comment: unmapped.comment,
            categories: unmapped.categories,
            recordTags: unmapped['record tags'],
            duration: unmapped.duration,
            durationMinutes: unmapped['duration minutes']
        }
    });
    return result;
}
