import { promises as fs } from "fs";
import { SimpleTimeTrackerImporter } from "./simple-time-tracker";

describe("SimpleTimeTracker", () => {
	test("should parse example data", async () => {
		const data = (await fs.readFile("test-data/stt_example.csv")).toString("utf-8");
		const events = new SimpleTimeTrackerImporter("").parseData(data);
		expect(events).toHaveLength(298);
        expect(events[0]).toEqual({
            name: "Guitar",
            start: "2023-11-06 20:08:25",
            end: "2023-11-06 20:27:22",
        });
	});
});
