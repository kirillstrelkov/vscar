/* eslint-disable @typescript-eslint/no-var-requires */
import { CarSchema } from "./src/cars/schemas/car.schema";
import configuration from "./config/configuration";


async function load_json_to_db(path: string) {
    const db_config = configuration().database;
    const uri = `mongodb://${db_config.host}:${db_config.port}/${db_config.name}`;
    console.log(`Loading ${path} to db ${uri}`);

    const mongoose = require('mongoose');
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const Car = mongoose.model('Cars', { CarSchema });
    await Car.deleteMany({}).then((docs: any) => { console.log('Removed:', docs); });

    const json = require(path);
    await Car.collection.insertMany(json).then((docs: any) => {
        console.log('Added:', docs.result);
        mongoose.connection.close();
    });
}

async function main() {
    const input_archive = "../db/db.zip";

    const tempDirectory = require('temp-dir');

    const output_dir = tempDirectory;
    try {
        console.log(`Extracting ${input_archive} to ${output_dir}`);

        const extract = require("extract-zip");
        await extract(input_archive, { dir: output_dir });

        console.log("Done\n");

    } catch (err) {
        console.log(err);
    }

    load_json_to_db(`${output_dir}/car.json`);
}

main();
