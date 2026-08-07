import { type Collection, type Document, MongoClient } from 'mongodb';
import { config } from './config.ts';

export interface CarAttribute {
  name: string;
  value: unknown;
  column_data?: {
    type: string;
    range?: { min: number; max: number };
    additional_values?: unknown[];
  };
}

export interface Car extends Document {
  adac_id: number;
  name: string;
  url: string;
  image: string;
  price: number;
  power: string;
  transmission: string;
  fuel: string;
  processed_date: string;
  attributes: CarAttribute[];
}

const client = new MongoClient(config.database.uri);
let connected = false;

async function ensureConnected(): Promise<void> {
  if (!connected) {
    await client.connect();
    connected = true;
  }
}

export async function getCarsCollection(): Promise<Collection<Car>> {
  await ensureConnected();
  return client.db().collection<Car>(config.database.table);
}

export async function ensureIndexes(): Promise<void> {
  const collection = await getCarsCollection();
  await collection.createIndex({ adac_id: 1 });
  await collection.createIndex({ name: 1 });
  await collection.createIndex({ price: 1 });
  await collection.createIndex({ 'attributes.name': 1 });
  await collection.createIndex({ 'attributes.value': 1 });
}

export async function closeConnection(): Promise<void> {
  if (connected) {
    await client.close();
    connected = false;
  }
}
