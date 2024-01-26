import { calendar_v3, google } from "googleapis";
import { Event } from "../types";
import { convertDate } from "../utils/date";

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
	Running: "11",
	Exercise: "6",
};

const categoryToSummary = {
	Guitar: "Guitar 🎸",
	Dev: "Dev 👨‍💻",
	Read: "Read 📚",
	Russian: "Russian 🇷🇺",
	Study: "Study 📖",
	Running: "Running 🏃",
	Exercise: "Exercise 🏋️",
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

export const insertEvent = async (calendar: calendar_v3.Calendar, event: CalendarEvent) => {
	return calendar.events.insert(event);
}

export const mapToEvent = (event: Event): CalendarEvent => {
	return {
		calendarId: process.env.CALENDAR_ID as string,
		requestBody: {
			summary: categoryToSummary[event.name as keyof typeof categoryToSummary] ?? "Other",
			colorId: categoryToColorId[event.name as keyof typeof categoryToColorId] ?? "1",
			start: {
				dateTime: convertDate(event.start).toISO() as string,
				timeZone: "Europe/Amsterdam",
			},
			end: {
				dateTime: convertDate(event.end).toISO() as string,
				timeZone: "Europe/Amsterdam",
			},
		},
	};
};
