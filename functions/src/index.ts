import * as functions from "firebase-functions";
import { insertEvents } from "./utils/calendar";
import { promises as fs } from 'fs';
import path = require('path');
import { StravaImporter } from "./sources/strava";
import { SimpleTimeTrackerImporter } from "./sources/simple-time-tracker";
import { Event } from "./models";

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

export const sync = functions.https.onRequest(async (request, response) => {
    if (request.headers.authorization !== process.env.AUTH_HEADER) {
        response.status(401).send('Unauthorized');
        return;
    }

    const googleCredsFile = await fs.readFile(CREDENTIALS_PATH);
    const googleCreds = JSON.parse(googleCredsFile.toString());

    const sources = [
	    new SimpleTimeTrackerImporter(googleCreds),
        new StravaImporter(),
    ];

    const events: Event[] = [];

    for (const source of sources) {
        const { data: events, error: sourceError } = await source.getEvents();

        if (sourceError) {
            console.error(sourceError);
            functions.logger.error(sourceError);
            response.status(500).send(sourceError);
            return;
        }

        if (events) {
            events.forEach((event: Event) => {
                events.push(event);
            });
        }
    }

    const yesterday = request.query.date ? new Date(request.query.date as string) : new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdaysActivities = events?.filter((row: Event) => {
        const date = new Date(row.start);
        return date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    });

    const { data: inserts, error: calendarError } = await insertEvents(googleCreds, yesterdaysActivities.filter((row: Event) => row.name !== ""));

    if (calendarError) {
        console.error(calendarError);
        functions.logger.error(calendarError);
        response.status(500).send(calendarError);
        return;
    }

    functions.logger.info(`Inserted ${inserts} events`);
    console.log(`Inserted ${inserts} events`);

    response.send('OK');
});
