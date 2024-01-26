import { Database, getDatabase } from "firebase-admin/database";

const DATA_REF = "data";

export const initDatabase = (): Database => {
	return getDatabase();
};

export const updateData = async (db: Database, object: any): Promise<{ error: string | null }> => {
	try {
		await db.ref(DATA_REF).update(object);
	} catch (err: any) {
		const errorMessage = `Could not update data: ${err.message}`;
		return { error: errorMessage };
	}

	return { error: null };
};

export const readData = async (db: Database, path: string): Promise<{ data: any; error: string | null }> => {
	try {
		const snapshot = await db.ref(DATA_REF).child(path).get();
		return { data: snapshot.val(), error: null };
	} catch (err: any) {
		const errorMessage = `Could not read data: ${err.message}`;
		return { data: null, error: errorMessage };
	}
};
