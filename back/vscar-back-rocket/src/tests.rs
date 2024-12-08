use std::str;

use crate::AttrValue;
use crate::PaginatedResult;
use crate::Query;
use crate::QueryAttr;
use crate::QueryRange;

use super::rocket;
use assertables::assert_contains;
use assertables::assert_contains_as_result;
use assertables::assert_gt;
use assertables::assert_gt_as_result;
use assertables::assert_is_match;
use assertables::assert_is_match_as_result;
use regex::Regex;
use rocket::http::Status;
use rocket::local::asynchronous::Client;
use serde::Deserialize;
use serde::Serialize;

fn init() {
    let _ = env_logger::builder()
        .is_test(true)
        .filter_level(log::LevelFilter::Trace)
        .try_init();
}

#[rocket::async_test]
async fn index_test() {
    init();

    let client = Client::tracked(super::rocket().await).await.unwrap();
    let req = client.get(uri!(super::index));
    let response = req.dispatch().await;
    assert_eq!(response.status(), Status::Ok);
    let content = response.into_string().await.unwrap();
    let routes = vec![
        "/",
        "/cars",
        "/cars/findByFilter",
        "/cars/<id>",
        "/cars/db/version",
        "/cars/attributes/names?<text>",
        "/cars/attributes/values?<text>",
    ];
    for route in &routes {
        assert_contains!(content, route);
    }
    assert_eq!(content.matches("GET").count(), routes.len() - 1);
    assert_eq!(content.matches("POST").count(), 1);
}

#[rocket::async_test]
async fn db_version_test() {
    init();

    let client = Client::tracked(super::rocket().await).await.unwrap();
    let req = client.get(uri!(super::db_version));
    let response = req.dispatch().await;
    assert_eq!(response.status(), Status::Ok);
    let content = response.into_string().await.unwrap();
    let data = Regex::new(r"\d+\-\d+\-\d+ \d+:\d+:\d+").unwrap();
    assert_is_match!(data, &content);
}

#[derive(Serialize, Deserialize, Debug)]
struct Car {
    name: String,
    url: String,
    adac_id: i32,
    processed_date: String,
    image: String,
    fuel: String,
    transmission: String,
    power: i32,
    price: i32,
    // TODO: add attributes and move to main.rs
}

#[rocket::async_test]
async fn get_car_test() {
    init();

    let adac_id = 324257;
    let client = Client::tracked(super::rocket().await).await.unwrap();
    let req = client.get(format!("/cars/{adac_id}"));
    let response = req.dispatch().await;
    assert_eq!(response.status(), Status::Ok);
    let car: Car = response.into_json().await.unwrap();
    assert_eq!(car.adac_id, adac_id);
    assert_gt!(car.price, 10000)
}

#[rocket::async_test]
async fn attr_names_with_text() {
    init();

    let client = Client::tracked(super::rocket().await).await.unwrap();
    let req = client.get(format!("/cars/attributes/names?text=preis"));
    let response = req.dispatch().await;
    assert_eq!(response.status(), Status::Ok);
    let json: Vec<String> = response.into_json().await.unwrap();
    let expected = vec!["Fahrzeugpreis", "Grundpreis"];
    assert_eq!(json, expected);
}

#[rocket::async_test]
async fn attr_names() {
    init();

    let client = Client::tracked(super::rocket().await).await.unwrap();
    let req = client.get(format!("/cars/attributes/names"));
    let response = req.dispatch().await;
    assert_eq!(response.status(), Status::Ok);
    let json: Vec<String> = response.into_json().await.unwrap();
    assert_gt!(json.len(), 10);
}

#[rocket::async_test]
async fn attr_values_with_range() {
    init();

    let client = Client::tracked(super::rocket().await).await.unwrap();
    let req = client.get(format!("/cars/attributes/values?text=Fahrzeugpreis"));
    let response = req.dispatch().await;
    assert_eq!(response.status(), Status::Ok);
    let value: AttrValue = response.into_json().await.unwrap();
    assert_eq!(value.typ, "float");
    assert_eq!(
        value.additional_values,
        vec![None, Some("k.A.".to_string())]
    );
    assert!(value.range["min"] > 10000);
    assert!(value.range["min"] < value.range["max"]);
    assert!(value.range["max"] > 70000);
}

#[rocket::async_test]
async fn attr_values_as_list() {
    init();

    let client = Client::tracked(super::rocket().await).await.unwrap();
    let req = client.get(format!("/cars/attributes/values?text=Getriebeart"));
    let response = req.dispatch().await;
    assert_eq!(response.status(), Status::Ok);
    let json: Vec<Option<String>> = response.into_json().await.unwrap();

    let expected = vec![
        None,
        Some("Automat. Schaltgetriebe (Doppelkupplung)".to_string()),
        Some("Automatikgetriebe".to_string()),
        Some("Automatisiertes Schaltgetriebe".to_string()),
        Some("CVT-Getriebe".to_string()),
        Some("Reduktionsgetriebe".to_string()),
        Some("Schaltgetriebe".to_string()),
    ];
    assert_eq!(json, expected);
}

#[rocket::async_test]
async fn find_by_filter() {
    init();

    let client = Client::tracked(super::rocket().await).await.unwrap();
    let req = client.post(format!("/cars/findByFilter"));
    let limit = 4;
    let value: Query = Query {
        page: 1,
        limit: Some(limit),
        text: "".to_string(),
        attributes: vec![QueryAttr {
            name: "Grundpreis".to_string(),
            values: vec![],
            range: Some(QueryRange {
                min: Some(8000),
                max: Some(100000),
            }),
        }],
    };
    let req = req.json(&value);
    let response = req.dispatch().await;
    assert_eq!(response.status(), Status::Ok);
    let result: PaginatedResult = response.into_json().await.unwrap();

    assert_eq!(result.docs.len() as i32, limit);
    assert_gt!(result.total, 6000);
    assert_eq!(result.limit, limit);
    assert_eq!(result.offset, 0);
    assert_eq!(result.page, 1);
    assert_gt!(result.pages, 1585);
}

#[rocket::async_test]
async fn find_by_filter_multiple_attrs() {
    init();

    let client = Client::tracked(super::rocket().await).await.unwrap();
    let req = client.post(format!("/cars/findByFilter"));
    let limit = 4;
    let value: Query = Query {
        page: 1,
        limit: Some(limit),
        text: "".to_string(),
        attributes: vec![
            QueryAttr {
                name: "Grundpreis".to_string(),
                values: vec![],
                range: Some(QueryRange {
                    min: Some(8000),
                    max: Some(100000),
                }),
            },
            QueryAttr {
                name: "Motorart".to_string(),
                values: vec![Some("Elektro".to_string()), Some("Gas".to_string())],
                range: None,
            },
        ],
    };
    let req = req.json(&value);
    let response = req.dispatch().await;
    assert_eq!(response.status(), Status::Ok);
    let result: PaginatedResult = response.into_json().await.unwrap();

    assert_eq!(result.docs.len() as i32, limit);
    assert_gt!(result.total, 30);
    assert_eq!(result.limit, limit);
    assert_eq!(result.offset, 0);
    assert_eq!(result.page, 1);
    assert_gt!(result.pages, 7);
}
