import admin from "firebase-admin";
import * as functions from "firebase-functions";
import { promises as fs } from "fs";
import path = require("path");
import { initCalendar, insertEvent, mapToEvent } from "./helpers/calendar";
import { Event } from "./types";
import { authMiddleware, tryCatchMiddleware } from "./middleware";
import { SimpleTimeTrackerImporter } from "./sources/simple-time-tracker";
import { StravaImporter } from "./sources/strava";

admin.initializeApp();

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

export const sync = functions.https.onRequest(authMiddleware(tryCatchMiddleware(handleSync)));

async function handleSync(request: functions.https.Request, response: functions.Response<any>) {
	const googleCreds = await getGoogleCreds();

	const yesterday = getYesterday(request.query.date as string);

	const sources = [new SimpleTimeTrackerImporter(googleCreds), new StravaImporter(yesterday)];

	const events: Event[] = [];

	await Promise.all(
		sources.map(async (source) => {
			const { data, error } = await source.getEvents();

			if (error) {
				throw new Error(error);
			}

			if (data) {
				for (const event of data) {
					events.push(event);
				}
			}
		}),
	);

	if (!events) {
		throw new Error("No events");
	}

	
	const eventsToInsert = events.filter((event) => isYesterday(event, yesterday));

	if (eventsToInsert.length === 0) {
		throw new Error("No events to insert");
	}

	const calendarEvents = eventsToInsert.map(mapToEvent);

	const calendar = initCalendar(googleCreds);

	await Promise.all(calendarEvents.map(async (event) => {
		const { error } = await insertEvent(calendar, event);
		if (error) {
			throw new Error(error);
		}
	}));

	response.send("OK");
	// Add Telegram notification
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
