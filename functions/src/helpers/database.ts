import {Database, getDatabase} from "firebase-admin/database";

const DATA_REF = "data";

export const initDatabase = (): Database => {
    return getDatabase();
}

export const updateData = async (db: Database, object: any): Promise<void> => {
    await db.ref(DATA_REF).update(object);
}

export const readData = async (db: Database, path: string): Promise<any> => {
    const snapshot = await db.ref(DATA_REF).child(path).get();
    return snapshot.val();
}
