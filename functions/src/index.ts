import admin from "firebase-admin";
import * as functions from "firebase-functions";
import { promises as fs } from "fs";
import path = require("path");
import { initCalendar, insertEvent, mapToEvent } from "./helpers/calendar";
import { Event } from "./types";
import { authMiddleware } from "./middleware";
import { SimpleTimeTrackerImporter } from "./sources/simple-time-tracker";
import { StravaImporter } from "./sources/strava";

admin.initializeApp();

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

export const sync = functions.https.onRequest(authMiddleware(handleSync));

async function handleSync(request: functions.https.Request, response: functions.Response<any>) {
	const googleCreds = await getGoogleCreds();

	const yesterday = getYesterday(request.query.date as string);

	const sources = [new SimpleTimeTrackerImporter(googleCreds), new StravaImporter(yesterday)];

	const events: Event[] = [];

	await Promise.all(
		sources.map(async (source) => {
			const { data, error } = await source.getEvents();

			if (error) {
				console.error(error);
				functions.logger.error(error);
				response.status(500).send(error);
				return;
			}

			if (data) {
				for (const event of data) {
					events.push(event);
				}
			}
		}),
	);

	if (!events) {
		response.status(500).send("No events");
		return;
	}

	
	const eventsToInsert = events.filter((event) => isYesterday(event, yesterday));

	if (eventsToInsert.length === 0) {
		response.send("No events to insert");
		return;
	}

	const calendar = await initCalendar(googleCreds);

	const calendarEvents = eventsToInsert.map(mapToEvent);

	await Promise.all(calendarEvents.map((event) => insertEvent(calendar, event)));

	response.send("OK");
}

const getGoogleCreds = async () => {
	const googleCredsFile = await fs.readFile(CREDENTIALS_PATH);
	return JSON.parse(googleCredsFile.toString());
};

const getYesterday = (customDate?: string) => {
	const yesterday = customDate ? new Date(customDate) : new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return yesterday;
};

const isYesterday = (event: Event, yesterday: Date) => {
	const date = new Date(event.start);
	return (
		date.getDate() === yesterday.getDate() &&
		date.getMonth() === yesterday.getMonth() &&
		date.getFullYear() === yesterday.getFullYear()
	);
};
