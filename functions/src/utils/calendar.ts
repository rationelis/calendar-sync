import { calendar_v3, google } from 'googleapis';
import { Event } from '../models';
import { DateTime } from 'luxon';

const categoryToColorId = {
    "Guitar": "3", 
    "Dev": "5",
    "Read": "4",
    "Russian": "10",
    "Study": "7",
};

const categoryToSummary = {
    "Guitar": "Guitar 🎸",
    "Dev": "Dev 👨‍💻",
    "Read": "Read 📚",
    "Russian": "Russian 🇷🇺",
    "Study": "Study 📖",
};

const CALENDAR_NAME = process.env.CALENDAR_NAME;

export const initCalendar = async (creds: any): Promise<calendar_v3.Calendar> => {
    return google.calendar({
        version: 'v3',
        auth: new google.auth.GoogleAuth({
            credentials: creds,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        }),
    });
}

export const insertEvents = async (calendar: calendar_v3.Calendar, events: Event[]): Promise<{ data: any, error: string | null }> => {
    const inserts = events.map((event) => {
        const addEvent = {
            calendarId: CALENDAR_NAME,
            requestBody: {
                summary: event.name,
                // colorId: categoryToColorId[event.name] ?? "1",
                start: {
                    dateTime: DateTime.fromFormat(event.start, 'yyyy-MM-dd HH:mm:ss', { zone: 'Europe/Amsterdam' }).toISO(),
                    timeZone: 'Europe/Amsterdam',
                },
                end: {
                    dateTime: DateTime.fromFormat(event.end, 'yyyy-MM-dd HH:mm:ss', { zone: 'Europe/Amsterdam' }).toISO(),
                    timeZone: 'Europe/Amsterdam',
                },
            },
        };

        return calendar.events.insert(addEvent);
    });
    
    Promise.all(inserts);

    return {
        data: inserts.length,
        error: null,
    };
}

// export const insertEvents = async (creds: any, events: SpreadsheetRow[]): Promise<{ data: any, error: string | null }> => {
//     const calendar = google.calendar({
//         version: 'v3',
//         auth: new google.auth.GoogleAuth({
//             credentials: creds,
//             scopes: ['https://www.googleapis.com/auth/calendar'],
//         }),
//     });

//     const insertPromises = events.map((event) => {
//         event.categories = event.categories.slice(1, -1).trim();
        
//         const color = categoryToColorId[event.categories as keyof typeof categoryToColorId] ?? "1";
//         const summary = categoryToSummary[event.categories as keyof typeof categoryToSummary] ?? "Other";

//         const addEvent = {
//             calendarId: CALENDAR_NAME,
//             requestBody: {
//                 summary: summary,
//                 colorId: color,
//                 start: {
//                     dateTime: DateTime.fromFormat(event.timeStarted, 'yyyy-MM-dd HH:mm:ss', { zone: 'Europe/Amsterdam' }).toISO(),
//                     timeZone: 'Europe/Amsterdam',
//                 },
//                 end: {
//                     dateTime: DateTime.fromFormat(event.timeEnded, 'yyyy-MM-dd HH:mm:ss', { zone: 'Europe/Amsterdam' }).toISO(),
//                     timeZone: 'Europe/Amsterdam',
//                 },
//             },
//         };

//         return calendar.events.insert(addEvent);
//     });

//     const inserts = insertPromises.length;

//     const results = await Promise.all(insertPromises);

//     if (!results) {
//         return {
//             data: null,
//             error: 'No results',
//         };
//     }

//     return {
//         data: inserts,
//         error: null,
//     };
// };
