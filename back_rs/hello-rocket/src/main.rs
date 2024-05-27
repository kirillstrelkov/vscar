#[macro_use]
extern crate rocket;
extern crate dotenv_codegen;

use crate::rocket::futures::StreamExt;
use dotenv_codegen::dotenv;
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use rocket_db_pools::mongodb::{
    bson::{doc, Bson, Document},
    options::{ClientOptions, FindOptions},
    Client,
};
type MongoDbConnection = State<Client>;
use futures::stream;
// use serde::{Deserialize, Serialize};
// #[derive(Serialize, Deserialize, Debug)]
// struct Car {
//     name: String,
//     adac_id: i32,
//     price: i32,
// }

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

// TODO:
// GET /
// POST /cars​/findByFilter

// GET /cars​/attributes​/names
#[get("/cars/attributes/names/<text>")]
async fn find_names(db: &MongoDbConnection, text: &str) -> Result<Json<Vec<String>>, Status> {
    // Initialize the MongoDB client and select the database and collection
    let collection: rocket_db_pools::mongodb::Collection<Document> =
        db.database("vscar").collection("cars");

    // Find one document in the collection
    let maybe_doc = collection.find_one(None, None).await;
    let doc = match maybe_doc {
        Ok(doc) => doc.unwrap(),
        Err(_) => return Err(Status::NotFound),
    };

    // Extract the 'attributes' field as an array of documents
    let attributes = doc.get_array("attributes").unwrap_or(&Vec::new()).to_vec();

    // Transform the stream of documents
    let names = stream::iter(attributes)
        .filter_map(|attr| async move {
            let attr_doc = attr.as_document()?;
            let name = attr_doc.get_str("name").ok()?;
            if !name.ends_with("fixed") && name.to_lowercase().contains(&text.to_lowercase()) {
                Some(name.to_string())
            } else {
                None
            }
        })
        .collect::<Vec<String>>()
        .await;

    // Sort the names
    let mut sorted_names = names;
    sorted_names.sort();

    Ok(Json(sorted_names))
}

// TODO: fixme
// GET /cars​/attributes​/values
// #[get("/cars​/attributes​/values/<text>")]
// async fn find_values(db: &MongoDbConnection, text: String) -> Result<Json<Vec<String>>, Status> {
//     let collection: rocket_db_pools::mongodb::Collection<Document> =
//         db.database("vscar").collection("cars");

//     // Query to find a document with the matching 'name' attribute
//     let filter = doc! { "attributes": { "$elemMatch": { "name": text } } };
//     let projection = doc! { "_id": 0, "attributes": 1 };
//     let maybe_doc = collection.find_one(Some(filter), None).await;
//     let doc = match maybe_doc {
//         Ok(doc) => doc.unwrap(),
//         Err(_) => return Err(Status::NotFound),
//     };

//     // Process the document based on the type of the 'column_data'
//     if let Some(attributes) = doc.get_array("attributes").ok() {
//         for attr in attributes {
//             match attr.as_document() {
//                 Ok(attr_doc) => {
//                     if let Some(column_data) = attr_doc.get("column_data") {
//                         match column_data {
//                             Bson::Array(_) => {
//                                 // Process numeric attributes
//                                 // ...

//                             }
//                             Bson::String(_) => {
//                                 // Process string attributes
//                                 // ...
//                             }
//                             _ => (),
//                         }
//                     }
//                 }
//                 _ => (),
//             }
//         }
//     }

//     Ok(Json(vec![]))
// }

#[get("/cars/db/version")]
async fn db_version(db: &MongoDbConnection) -> Result<String, Status> {
    let collection: rocket_db_pools::mongodb::Collection<Document> =
        db.database("vscar").collection("cars");
    let car = collection.find_one(None, None).await.unwrap();

    match car {
        Some(car) => Ok(car
            .get_str("processed_date")
            .unwrap()
            .split('.')
            .collect::<Vec<_>>()[0]
            .to_string()),
        None => Err(Status::NotFound),
    }
}

#[get("/cars")]
async fn get_cars(db: &MongoDbConnection) -> Result<Json<Vec<Document>>, Status> {
    let collection = db.database("vscar").collection("cars");
    let find_options: FindOptions = FindOptions::builder()
        .sort(doc! { "price": 1 })
        .limit(10)
        .build();
    let cursor = match collection.find(None, find_options).await {
        Ok(cursor) => cursor,
        Err(_) => return Err(Status::InternalServerError), // Handle the error appropriately
    };
    let results: Vec<Result<Document, _>> = cursor.collect().await;
    let vehicles = results
        .into_iter()
        .filter_map(|result| result.ok())
        .collect();

    Ok(Json(vehicles))
}

#[get("/cars/<id>")]
async fn get_car(db: &MongoDbConnection, id: i32) -> Result<Json<Document>, Status> {
    let collection: rocket_db_pools::mongodb::Collection<_> =
        db.database("vscar").collection("cars");
    let filter = doc! { "adac_id": id };

    let car: Option<Document> = collection.find_one(filter, None).await.unwrap();
    match car {
        Some(car) => Ok(Json(car)),
        None => Err(Status::NotFound),
    }
}

#[launch]
async fn rocket() -> _ {
    // add port
    let mongodb_uri = dotenv!("DATABASE_URI");
    let client_options = ClientOptions::parse(mongodb_uri).await.unwrap();
    let client = Client::with_options(client_options).unwrap();

    rocket::build()
        .manage(client)
        .mount("/", routes![get_car, get_cars, find_names, db_version])
}
