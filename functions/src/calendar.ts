import { google } from 'googleapis';
import { SpreadsheetRow } from './models';
import { DateTime } from 'luxon';

const categoryToColorId = {
    "Guitar": "7", 
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
        const summary = categoryToSummary[event.categories as keyof typeof categoryToSummary] ?? "Other";

        const addEvent = {
            calendarId: process.env.CALENDAR_ID,
            requestBody: {
                summary: summary,
                colorId: color,
                start: {
                    dateTime: DateTime.fromFormat(event.timeStarted, 'yyyy-MM-dd HH:mm:ss', { zone: 'Europe/Amsterdam' }).toISO(),
                    timeZone: 'Europe/Amsterdam',
                },
                end: {
                    dateTime: DateTime.fromFormat(event.timeEnded, 'yyyy-MM-dd HH:mm:ss', { zone: 'Europe/Amsterdam' }).toISO(),
                    timeZone: 'Europe/Amsterdam',
                },
            },
        };

        return calendar.events.insert(addEvent);
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
