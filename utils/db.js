import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let cachedDb = null;

export async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  await client.connect();
  const db = client.db('support');
  cachedDb = db;
  return db;
}