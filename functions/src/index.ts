import admin from "firebase-admin";
import * as functions from "firebase-functions";
import { promises as fs } from "fs";
import path = require("path");
import { initCalendar, insertEvent, mapToEvent } from "./helpers/calendar";
import { Event } from "./types";
import { authMiddleware, tryCatchMiddleware } from "./middleware";
import { SimpleTimeTrackerImporter } from "./sources/simple-time-tracker";
import { StravaImporter } from "./sources/strava";
import { sendMessage } from "./helpers/telegram";

admin.initializeApp();

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

export const sync = functions.https.onRequest(authMiddleware(tryCatchMiddleware(handleSync)));

async function handleSync(request: functions.https.Request, response: functions.Response<any>) {
	const googleCreds = await getGoogleCreds();

	const yesterday = getYesterday(request.query.date as string);

	let sources = [
		{ name: "STT", instance: new SimpleTimeTrackerImporter(googleCreds) },
		{ name: "Strava", instance: new StravaImporter(yesterday) },
	];

	const singleRun = request.query.singleRun as string | undefined;

	if (singleRun) {
		sources = sources.filter((source) => source.name.toLowerCase() === singleRun.toLowerCase());
	}

	const events: Event[] = [];

	let telegramMessage = "⏳ Calendar Sync 🔄\n";

	await Promise.all(
		sources.map(async (source) => {
			const { data, error } = await source.instance.getEvents();

			if (error || !data) {
				telegramMessage += `❌ *${source.name}:* ${error}\n`; 
				return;
			}

			const yesterdayEvents = data.filter((event: Event) => isYesterday(event, yesterday));

			telegramMessage += `✅ *${source.name}*: ${yesterdayEvents?.length || 0} events\n`;

			events.push(...yesterdayEvents);
		})
	);

	if (events.length === 0) {
		telegramMessage += "🤔 No events to insert";
		await sendMessage(telegramMessage);
		return response.send("OK");
	}

	const calendarEvents = events.map(mapToEvent);

	const calendar = initCalendar(googleCreds);

	await Promise.all(
		calendarEvents.map(async (event) => {
			const { error } = await insertEvent(calendar, event);
			if (error) {
				console.error(error);
			}
		})
	);

	await sendMessage(telegramMessage);

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
