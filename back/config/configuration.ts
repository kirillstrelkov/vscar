export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
        uri: `mongodb://${process.env.DATABASE_HOST || 'localhost'}:${parseInt(process.env.DATABASE_PORT, 10) || 27017}/${process.env.DATABASE_NAME || 'carvs'}`,
        // TODO: cleanup
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT, 10) || 27017,
        name: process.env.DATABASE_NAME || 'carvs',
        table: process.env.DATABASE_TABLE || 'cars'
    }
});