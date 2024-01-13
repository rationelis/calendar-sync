import * as functions from "firebase-functions";
import { getSpreadsheet } from "./drive";
import { insertEvents } from "./calendar";
import { promises as fs } from 'fs';
import path = require('path');
import { SpreadsheetRow } from "./models";

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

export const sync = functions.https.onRequest(async (request, response) => {
    if (request.headers.authorization !== process.env.AUTH_HEADER) {
        response.status(401).send('Unauthorized');
        return;
    }

    const content = await fs.readFile(CREDENTIALS_PATH);
    const creds = JSON.parse(content.toString());
    
    const { data: events, error } = await getSpreadsheet(creds);

    if (error) {
        console.error(error);
        functions.logger.error(error);
        response.status(500).send(error);
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdaysActivities = events?.filter((row: SpreadsheetRow) => {
        const date = new Date(row.timeStarted);
        return date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    });

    const { data: inserts, error: calendarError } = await insertEvents(creds, yesterdaysActivities.filter((row: SpreadsheetRow) => row.activityName !== ""));

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
