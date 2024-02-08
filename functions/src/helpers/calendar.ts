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
	Gym: "6",
};

const categoryToSummary = {
	Guitar: "Guitar 🎸",
	Dev: "Dev 👨‍💻",
	Read: "Read 📚",
	Russian: "Russian 🇷🇺",
	Study: "Study 📖",
	Running: "Running 🏃",
	Exercise: "Exercise 🏋️",
	Gym: "Gym 🏋️",
};

export const initCalendar = (creds: any): calendar_v3.Calendar => {
	return google.calendar({
		version: "v3",
		auth: new google.auth.GoogleAuth({
			credentials: creds,
			scopes: ["https://www.googleapis.com/auth/calendar"],
		}),
	});
};

export const insertEvent = async (calendar: calendar_v3.Calendar, event: CalendarEvent): Promise<{ data: any; error: string | null }> => {
	try {
		const response = await calendar.events.insert(event);
		return { data: response.data, error: null };
	} catch (err: any) {
		const errorMessage = `Could not insert event: ${err.message}`;
		return { data: null, error: errorMessage };
	}
};

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
