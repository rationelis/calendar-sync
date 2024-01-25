import * as functions from "firebase-functions";

export const authMiddleware =
	(handler: any) => (request: functions.https.Request, response: functions.Response<any>) => {
		if (request.headers.authorization !== functions.config().auth.token) {
			response.status(401).send("Unauthorized");
			return;
		}

		return handler(request, response);
	};