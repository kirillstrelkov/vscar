/* eslint-disable @typescript-eslint/no-var-requires */
import { CarSchema } from "./src/cars/schemas/car.schema";
import configuration from "./config/configuration";


async function load_json_to_db(path: string) {

    const db_config = configuration().database;
    const uri = db_config.uri;
    console.log(`Loading ${path} to db ${uri}`);

    const mongoose = require('mongoose');
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // TODO: improve
    const Car = mongoose.model('Cars', { CarSchema });
    await Car.cleanIndexes();

    await Car.deleteMany({}).then((docs: any) => { console.log('Removed:', docs); });

    const json = require(path);
    await Car.collection.insertMany(json).then((docs: any) => {
        console.log('Added:', docs.result);
        mongoose.connection.close();
    });
}

async function main() {
    const input_archive = "../../db/db.zip";

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
