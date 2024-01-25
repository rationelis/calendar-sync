import { EventImporter } from "../types";

export class StravaImporter implements EventImporter {
    constructor(private yesterday: Date) {}

	async getEvents(): Promise<{ data: any; error: string | null }> {
        // Step 1: Retrieve access token and refresh token from database.

        // Step 2: Use refresh token to retrieve new access token.

        // Step 3: Store new access token in database.

        // Step 4: Use new access token to retrieve data from Strava.

        // Step 5: Return data.

		const data = {};
		return { data, error: null };
	}
}
