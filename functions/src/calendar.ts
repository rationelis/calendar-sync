import { google } from 'googleapis';
import { SpreadsheetRow } from './models';

const categoryToColorId = {
    "Guitar": "11",
    "Dev": "5",
    "Read": "4",
    "Russian": "10",
};

const categoryToSummary = {
    "Guitar": "Guitar 🎸",
    "Dev": "Dev 👨‍💻",
    "Read": "Read 📚",
    "Russian": "Russian 🇷🇺",
};

export const insertEvents = async (creds: any, events: SpreadsheetRow[]): Promise<{ data: any, error: string | null }> => {
    const calendar = google.calendar({
        version: 'v3',
        auth: new google.auth.GoogleAuth({
            credentials: creds,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        }),
    });

    const insertPromises = events.map((event) => {
        event.categories = event.categories.slice(1, -1).trim();
        
        const color = categoryToColorId[event.categories as keyof typeof categoryToColorId] ?? "1";

        return calendar.events.insert({
            calendarId: process.env.CALENDAR_ID,
            requestBody: {
                summary: categoryToSummary[event.categories as keyof typeof categoryToSummary] ?? event.categories,
                colorId: color,
                start: {
                    dateTime: new Date(event.timeStarted).toISOString(),
                    timeZone: 'Europe/Amsterdam',
                },
                end: {
                    dateTime: new Date(event.timeEnded).toISOString(),
                    timeZone: 'Europe/Amsterdam',
                },
            },
        });
    });

    const inserts = insertPromises.length;

    const results = await Promise.all(insertPromises);

    if (!results) {
        return {
            data: null,
            error: 'No results',
        };
    }

    return {
        data: inserts,
        error: null,
    };
};
