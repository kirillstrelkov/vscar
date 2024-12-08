#[macro_use]
extern crate rocket;
extern crate dotenv_codegen;

use std::collections::{HashMap, HashSet};
use std::env;

use crate::rocket::futures::StreamExt;
use dotenv_codegen::dotenv;
use env_logger::Env;
use log::{debug, warn};
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::serde::{Deserialize, Serialize};
use rocket::State;
use rocket_db_pools::mongodb::options::{AggregateOptions, FindOneOptions};
use rocket_db_pools::mongodb::{
    bson::{doc, Document},
    options::{ClientOptions, FindOptions},
    Client,
};
type MongoDbConnection = State<Client>;
use futures::stream;
use rocket::http::Method;
use rocket_cors::{AllowedOrigins, CorsOptions};

#[cfg(test)]
mod tests;

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
enum Object {
    StringVec(Vec<Option<String>>),
    AttrValue(AttrValue),
}

#[derive(Serialize, Deserialize, Debug)]
struct AttrValue {
    #[serde(rename = "type")]
    pub typ: String,
    pub additional_values: Vec<Option<String>>,
    pub range: HashMap<String, usize>,
}

#[get("/")]
async fn index() -> String {
    let mut out = "API:\n\n".to_string();

    for route in rocket().await.routes() {
        out.push_str(&format!("{} \t {}\n", route.method, route.uri));
    }
    out
}

#[derive(Serialize, Deserialize, Debug)]
struct QueryRange {
    min: Option<i32>,
    max: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug)]
struct QueryAttr {
    name: String,
    values: Vec<Option<String>>,
    range: Option<QueryRange>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Query {
    page: i32,
    limit: Option<i32>,
    text: String,
    attributes: Vec<QueryAttr>,
}

#[derive(Serialize, Deserialize, Debug, Default)]
struct PaginatedResult {
    docs: Vec<Document>,
    total: i32,
    limit: i32,
    page: i32,
    pages: i32,
    offset: i32,
}

#[post("/cars/findByFilter", data = "<query>")]
async fn find_by_filter(
    db: &MongoDbConnection,
    query: Json<Query>,
) -> Result<Json<PaginatedResult>, Status> {
    let collection: rocket_db_pools::mongodb::Collection<Document> =
        db.database("vscar").collection("cars");

    debug!("Find cars with filter: {:?}", query);
    let page = query.page;
    let text = &query.text;
    let limit = query.limit.unwrap_or(100);

    let mut attr_queries = vec![];
    for attr in &query.attributes {
        let key = &attr.name;
        let values = &attr.values;

        let mut attr_query = vec![];
        if let Some(range) = &attr.range {
            attr_query.push(doc! { "attributes": { "$elemMatch": {
                "name": key.clone() + "|fixed",
                "value" : {"$gte": range.min, "$lte": range.max}} }
            });
        }
        if !values.is_empty() {
            attr_query.push(doc! {
              "attributes": {
                "$elemMatch": {
                  "name": key,
                  "value": {
                    "$in": values,
                  }
                }
              }
            })
        }
        if !attr_query.is_empty() {
            attr_queries.push(doc! {
                "$or": attr_query,
            });
        }
        debug!("Attr: {:?}", attr);
    }
    debug!("Db query: {:?}", attr_queries);

    let mut db_query = doc! {};
    if !attr_queries.is_empty() {
        db_query.insert("$and", attr_queries);
    }
    if !text.is_empty() {
        db_query.insert(
            "name",
            doc! {
                "$regex": text,
                "$options": "i"
            },
        );
    }
    let pipeline = vec![
        doc! {
            "$match": db_query
        },
        doc! {
            "$sort": { "price": 1 }
        },
        doc! {
            "$facet": {
                "paginatedResults": vec![
                    doc! {
                        "$skip": (page - 1) * limit,
                    },
                    doc! {
                        "$limit": limit,
                    }
                ],
                "totalCount": vec![
                    doc! {
                        "$count": "total"
                    }
                ],
            }
        },
    ];

    debug!("Pipeline: {:?}", pipeline);
    let mut cursor = collection.aggregate(pipeline, None).await.unwrap();

    let doc = cursor.next().await.unwrap().unwrap();
    let total_counts = doc.get_array("totalCount").unwrap();
    let paginated_results = doc.get_array("paginatedResults").unwrap();

    debug!("totalCount: {:?}", total_counts);
    let mut result = PaginatedResult {
        page,
        limit,
        ..Default::default()
    };
    if !paginated_results.is_empty() && !total_counts.is_empty() {
        result.docs = paginated_results
            .iter()
            .map(|doc| doc.as_document().unwrap().clone())
            .collect();
        result.total = total_counts[0]
            .as_document()
            .unwrap()
            .get_i32("total")
            .unwrap();

        result.pages = (result.total as f64 / limit as f64).ceil() as i32;
        result.offset = (page - 1) * limit;
    }

    Ok(Json(result))
}

#[get("/cars/attributes/names?<text>")]
async fn find_names(
    db: &MongoDbConnection,
    text: Option<&str>,
) -> Result<Json<Vec<String>>, Status> {
    let text = text.unwrap_or("");
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

impl AttrValue {
    fn build(doc: &Document) -> Self {
        let values = doc
            .get_array("additional_values")
            .unwrap()
            .iter()
            .map(|v| v.as_str().map(|s| s.to_string()))
            .collect();
        let mut range = HashMap::<String, usize>::new();
        let doc_range = doc.get_document("range").unwrap();
        debug!("Range: {:?}", doc_range);
        debug!("get: {:?}", doc_range.get("min"));
        let min = doc_range.get_i32("min").ok();
        let max = doc_range.get_i32("max").ok();
        if min.is_none() || max.is_none() {
            warn!("No min or max in range: {:?}", doc_range);
        }

        let min = min.unwrap_or_default();
        let max = max.unwrap_or_default();

        range.insert("min".to_string(), min as usize);
        range.insert("max".to_string(), max as usize);

        AttrValue {
            typ: doc.get_str("type").unwrap().to_string(),
            additional_values: values,
            range,
        }
    }
}

#[get("/cars/attributes/values?<text>")]
async fn find_values(db: &MongoDbConnection, text: String) -> Result<Json<Object>, Status> {
    debug!("Finding values for {:?}", text);

    let collection: rocket_db_pools::mongodb::Collection<Document> =
        db.database("vscar").collection("cars");

    // Query to find a document with the matching 'name' attribute
    let filter = doc! { "attributes": { "$elemMatch": { "name": text.clone() } } };
    let find_options = FindOneOptions::builder()
        .projection(doc! { "attributes.$": 1 })
        .build();

    let maybe_doc = collection.find_one(filter, Some(find_options)).await;
    let doc = match maybe_doc {
        Ok(doc) => doc.unwrap(),
        Err(_) => {
            debug!("Failed to find single car");
            return Err(Status::NotFound);
        }
    };

    if let Ok(attributes) = doc.get_array("attributes") {
        let first_element = &attributes[0].as_document();
        let col_data = first_element
            .unwrap()
            .get("column_data")
            .unwrap()
            .as_document()
            .unwrap();
        let att_type = col_data.get_str("type").unwrap_or("");

        match att_type {
            "int" | "float" => {
                return Ok(Json(Object::AttrValue(AttrValue::build(col_data))));
            }
            "str" => {
                let options = AggregateOptions::builder().build();
                let cursor = collection
                    .aggregate(
                        [
                            doc! { "$unwind": "$attributes" },
                            doc! { "$match": {"attributes.name": text.clone()} },
                            doc! { "$project": {"_id": 0, "value": "$attributes.value"} },
                        ],
                        options,
                    )
                    .await
                    .unwrap();

                let res: Vec<_> = cursor.collect().await;
                let res: HashSet<Option<String>> = res
                    .into_iter()
                    .map(|r| {
                        let doc = r.unwrap();
                        match doc.is_null("value") {
                            true => None,
                            false => doc.get_str("value").map(|v| v.to_string()).ok(),
                        }
                    })
                    .collect();

                let mut v = Vec::from_iter(res);
                v.sort();

                return Ok(Json(Object::StringVec(v)));
            }
            _ => {
                warn!("Unsupproted type {:?}", att_type);
                return Err(Status::NotFound);
            }
        }
    }

    Err(Status::NotFound)
}

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
    match env_logger::Builder::from_env(Env::default().default_filter_or("debug")).try_init() {
        Ok(_) => (),
        Err(e) => println!("NOTE: logger is not initialed: {:?}", e),
    }

    // add port
    let mongodb_uri = env::var("DATABASE_URI").unwrap_or(dotenv!("DATABASE_URI").to_string());
    let client_options = ClientOptions::parse(&mongodb_uri).await.unwrap();
    let client = Client::with_options(client_options).unwrap();
    let cors = CorsOptions::default()
        .allowed_origins(AllowedOrigins::all())
        .allowed_methods(
            vec![Method::Get, Method::Post]
                .into_iter()
                .map(From::from)
                .collect(),
        )
        .allow_credentials(true);

    rocket::build()
        .manage(client)
        .attach(cors.to_cors().unwrap())
        .mount(
            "/",
            routes![
                index,
                db_version,
                get_car,
                get_cars,
                find_names,
                find_values,
                find_by_filter,
            ],
        )
}
