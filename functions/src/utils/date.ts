import { DateTime } from "luxon";

export const convertDate = (date: string): DateTime => {
	return DateTime.fromFormat(date, "yyyy-MM-dd HH:mm:ss", {
		zone: "Europe/Amsterdam",
	});
};

