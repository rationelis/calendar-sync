import { Event, EventImporter } from "../types";
import { initDatabase, readData, updateData } from "../helpers/database";
import axios from "axios";
import { sanitizeDate } from "../utils/date";

export class StravaImporter implements EventImporter {
	constructor(private yesterday: Date) {}

	async getEvents(): Promise<{ data: any; error: string | null }> {
		const db = initDatabase();

		if (!db) {
			return { data: null, error: "Could not initialize database" };
		}

		const { data: refreshToken, error: readRefreshError } = await readData(db, "stravaRefreshToken");

		if (readRefreshError) {
			return { data: null, error: readRefreshError };
		}

		const { data: response, error: getTokensError } = await this.getTokens(refreshToken);

		if (getTokensError) {
			return { data: null, error: getTokensError };
		}

		const accessToken = response.access_token;

		if (!accessToken) {
			return { data: null, error: "No access token" };
		}

		const { error: updateRefreshError } = await updateData(db, {
			stravaRefreshToken: response.refresh_token,
		});

		if (updateRefreshError) {
			return { data: null, error: updateRefreshError };
		}

		const { data: activities, error: getActivitiesError } = await this.getActivities(accessToken);

		if (getActivitiesError) {
			return { data: null, error: getActivitiesError };
		}

		return { data: this.parseData(activities), error: null };
	}

	async getTokens(code: string): Promise<{ data: any; error: string | null }> {
		try {
			const response = await axios.post("https://www.strava.com/oauth/token", {
				client_id: process.env.STRAVA_CLIENT_ID,
				client_secret: process.env.STRAVA_CLIENT_SECRET,
				grant_type: "refresh_token",
				refresh_token: code,
			});
			return { data: response.data, error: null };
		} catch (err: any) {
			const errorMessage = `Could not get tokens: ${err.message}`;
			return { data: null, error: errorMessage };
		}
	}

	async getActivities(accessToken: string): Promise<{ data: any; error: string | null }> {
		try {
			const response = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
				params: {
					after: this.yesterday.getTime() / 1000,
				},
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			return { data: response.data, error: null };
		} catch (err: any) {
			const errorMessage = `Could not get activities: ${err.message}`;
			return { data: null, error: errorMessage };
		}
	}

	parseData = (data: any): Event[] => {
		return data.map((activity: any) => {
            let type = activity.type.toLowerCase();
            switch (type) {
                case "run":
                    type = "Running";
                    break;
                case "ride":
                    type = "Cycling";
                    break;
                case "swim":
                    type = "Swimming";
                    break;
                case "walk":
                    type = "Walking";
                    break;
                default:
                    type = "Exercise";
                    break;
            }
            
            return {
			    name: type,
			    start: sanitizeDate(activity.start_date_local),
			    end: sanitizeDate(new Date(activity.start_date_local).getTime() + activity.elapsed_time * 1000),
		    }
        });
	};
}
