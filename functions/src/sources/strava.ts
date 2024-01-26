import { Event, EventImporter } from "../types";
import { initDatabase, readData, updateData } from "../helpers/database";
import axios from "axios";

export class StravaImporter implements EventImporter {
	constructor(private yesterday: Date) {}

	async getEvents(): Promise<{ data: any; error: string | null }> {
		const db = initDatabase();

		const refreshToken = await readData(db, "stravaRefreshToken");

		if (!refreshToken) {
			return { data: null, error: "No refresh token" };
		}

		const response = await axios.post("https://www.strava.com/oauth/token", {
			client_id: process.env.STRAVA_CLIENT_ID,
			client_secret: process.env.STRAVA_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		});

		const accessToken = response.data.access_token;

		if (!accessToken) {
			return { data: null, error: "No access token" };
		}

		await updateData(db, {
			stravaRefreshToken: response.data.refresh_token,
		});

		const activities = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
			params: {
				after: this.yesterday.getTime() / 1000,
			},
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!activities) {
			return { data: null, error: "No activities" };
		}

		const events = activities.data.map((activity: any) => ({
			name: activity.name.toLowerCase().includes("run") ? "Running" : "Exercise",
			start: new Date(activity.start_date_local)
				.toISOString()
				.replace("T", " ")
				.replace("Z", "")
				.replace(".000", ""),
			end: new Date(new Date(activity.start_date_local).getTime() + activity.elapsed_time * 1000)
				.toISOString()
				.replace("T", " ")
				.replace("Z", "")
				.replace(".000", ""),
		}));

		return { data: events as Event[], error: null };
	}
}
