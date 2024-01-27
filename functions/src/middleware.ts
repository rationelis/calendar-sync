import * as functions from "firebase-functions";
import { sendMessage } from "./helpers/telegram";

export const authMiddleware =
	(handler: any) => (request: functions.https.Request, response: functions.Response<any>) => {
		if (request.headers.authorization !== process.env.AUTH_HEADER) {
			response.status(401).send("Unauthorized");
			return;
		}

		return handler(request, response);
	};

export const tryCatchMiddleware =
	(handler: any) => async (request: functions.https.Request, response: functions.Response<any>) => {
		try {
			return await handler(request, response);
		} catch (err: any) {
			console.error(err);
			functions.logger.error(err);
			response.status(500).send(err.message);
			const message = "⏳ Calendar Sync 🔄\n❌ Error: " + err.message;
			await sendMessage(message);
		}
	};