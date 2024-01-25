import { calendar_v3, google } from "googleapis";
import { Event } from "../models";
import { DateTime } from "luxon";

const CALENDAR_NAME = process.env.CALENDAR_NAME;

interface CalendarEvent {
	calendarId: string;
	requestBody: {
		summary: string;
		colorId: string;
		start: {
			dateTime: string;
			timeZone: string;
		};
		end: {
			dateTime: string;
			timeZone: string;
		};
	};
}

const categoryToColorId = {
	Guitar: "3",
	Dev: "5",
	Read: "4",
	Russian: "10",
	Study: "7",
};

const categoryToSummary = {
	Guitar: "Guitar 🎸",
	Dev: "Dev 👨‍💻",
	Read: "Read 📚",
	Russian: "Russian 🇷🇺",
	Study: "Study 📖",
};

export const initCalendar = async (creds: any): Promise<calendar_v3.Calendar> => {
	return google.calendar({
		version: "v3",
		auth: new google.auth.GoogleAuth({
			credentials: creds,
			scopes: ["https://www.googleapis.com/auth/calendar"],
		}),
	});
};

export const mapToEvent = (event: Event): CalendarEvent => {
	return {
		calendarId: CALENDAR_NAME as string,
		requestBody: {
			summary: categoryToSummary[event.name as keyof typeof categoryToSummary] ?? "Other",
			colorId: categoryToColorId[event.name as keyof typeof categoryToColorId] ?? "1",
			start: {
				dateTime: DateTime.fromFormat(event.start, "yyyy-MM-dd HH:mm:ss", {
					zone: "Europe/Amsterdam",
				}).toISO() as string,
				timeZone: "Europe/Amsterdam",
			},
			end: {
				dateTime: DateTime.fromFormat(event.end, "yyyy-MM-dd HH:mm:ss", {
					zone: "Europe/Amsterdam",
				}).toISO() as string,
				timeZone: "Europe/Amsterdam",
			},
		},
	};
};
