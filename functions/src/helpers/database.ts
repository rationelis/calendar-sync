import {Database, getDatabase} from "firebase-admin/database";

const DATA_REF = "data";

export const initDatabase = (): Database => {
    return getDatabase();
}

export const writeData = async (db: Database, path: string, data: any): Promise<void> => {
    await db.ref(DATA_REF + "/" + path).set(data);
}

export const readData = async (db: Database, path: string): Promise<any> => {
    const snapshot = await db.ref(DATA_REF).child(path).get();
    return snapshot.val();
}
