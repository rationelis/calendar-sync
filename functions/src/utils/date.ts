import { DateTime } from "luxon";

export const convertDate = (date: string): DateTime => {
	return DateTime.fromFormat(date, "yyyy-MM-dd HH:mm:ss", {
		zone: "Europe/Amsterdam",
	});
};

export const sanitizeDate = (input: string | number): string => {
	return new Date(input).toISOString().replace("T", " ").replace("Z", "").replace(".000", "");
};
