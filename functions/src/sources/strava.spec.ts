import { promises as fs } from "fs";
import { StravaImporter } from "./strava";

describe("Strava", () => {
	test("should parse example data", async () => {
		const data = JSON.parse(await fs.readFile("test-data/strava-example.json", "utf-8"));
		const strava = new StravaImporter(new Date());
		const [event] = strava.parseData(data);

		expect(event).toEqual({
			name: "Running",
			start: "2024-01-26 13:21:42",
			end: "2024-01-26 14:17:17",
		});
	});
});
