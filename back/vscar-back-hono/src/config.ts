const databaseHost = process.env.DATABASE_HOST || 'localhost';
const databasePort = parseInt(process.env.DATABASE_PORT ?? '', 10) || 27017;
const databaseName = process.env.DATABASE_NAME || 'vscar';

export const config = {
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  database: {
    uri: process.env.DATABASE_URI || `mongodb://${databaseHost}:${databasePort}/${databaseName}`,
    table: process.env.DATABASE_TABLE || 'cars',
  },
};
