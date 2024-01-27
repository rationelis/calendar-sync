import axios from "axios";

export const TELEGRAM_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;

export async function sendMessage(message: string): Promise<{ error: string | null }> {
	const body = {
		chat_id: process.env.TELEGRAM_CHAT_ID,
		text: message,
		parse_mode: "Markdown",
	};

	try {
		await axios.post(`${TELEGRAM_URL}/sendMessage`, body);
	} catch (error: any) {
		return { error: error.message };
	}

	return { error: null };
}
