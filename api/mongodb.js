import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'tnstc';
const COLLECTION_NAME = 'config';
const MAIN_USER_ID = 'main_user';

let cachedClient = null;
let cachedDb = null;

// In-memory fallback if MONGODB_URI is not yet provided in local dev
let fallbackMemoryState = null;

export async function getMongoClient() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    return null;
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  });

  await client.connect();
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

/**
 * Fetch the single main user configuration document from MongoDB
 */
export async function getMainUserState() {
  const conn = await getMongoClient();

  if (!conn) {
    return fallbackMemoryState;
  }

  const { db } = conn;
  const collection = db.collection(COLLECTION_NAME);
  const doc = await collection.findOne({ _id: MAIN_USER_ID });

  if (!doc) {
    return null;
  }

  // Remove MongoDB internal _id for frontend compatibility
  const { _id, ...stateData } = doc;
  return stateData;
}

/**
 * Update the single main user configuration document in MongoDB
 */
export async function saveMainUserState(state) {
  fallbackMemoryState = state;

  const conn = await getMongoClient();
  if (!conn) {
    return { success: true, warning: 'Saved to memory (MONGODB_URI not defined)' };
  }

  const { db } = conn;
  const collection = db.collection(COLLECTION_NAME);

  await collection.updateOne(
    { _id: MAIN_USER_ID },
    {
      $set: {
        ...state,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  return { success: true };
}

