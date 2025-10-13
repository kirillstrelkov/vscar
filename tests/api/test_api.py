"""API tests for the car application."""

import os
import re

import requests

__PORT = os.environ.get("PORT", "3000")
__URL = f"http://localhost:{__PORT}"
__CAR_JSON_KEYS = [
    "name",
    "url",
    "image",
    "price",
    "power",
    "transmission",
    "fuel",
    "processed_date",
    "attributes",
]


def __get(url: str) -> requests.Response:
    return requests.get(url, timeout=10)


def __post(url: str, json_data: dict) -> requests.Response:
    return requests.post(url, json=json_data, timeout=10)


def __assert_single_car_json(obj: dict) -> None:
    for key in __CAR_JSON_KEYS:
        assert key in obj

    assert len([attr for attr in obj["attributes"] if attr["name"] == "Marke"]) == 1


def test_db_version() -> None:
    """Test database version endpoint."""
    response = __get(f"{__URL}/cars/db/version")
    assert response.status_code == requests.codes.ok
    assert re.match(r"^\d+\-\d+\-\d+ \d+\:\d+\:\d+$", response.content.decode())


def test_get_cars() -> None:
    """Test get all cars endpoint."""
    response = __get(f"{__URL}/cars")
    assert response.status_code == requests.codes.ok
    assert len(response.json()) == 10  # noqa: PLR2004


def test_get_car_by_id() -> None:
    """Test get car by id endpoint."""
    response = __get(f"{__URL}/cars")

    car_id = response.json()[0]["adac_id"]
    response = __get(f"{__URL}/cars/{car_id}")
    assert response.status_code == requests.codes.ok
    obj = response.json()
    assert obj["adac_id"] == car_id

    __assert_single_car_json(obj)


def test_get_attributes_names() -> None:
    """Test get attributes names endpoint."""
    response = __get(f"{__URL}/cars/attributes/names")
    assert response.status_code == requests.codes.ok
    attrs = response.json()
    assert len(attrs) > 210  # noqa: PLR2004
    assert "Grundpreis" in attrs
    assert "Höchstgeschwindigkeit" in attrs


def test_get_attributes_names_with_text() -> None:
    """Test get attributes names with text filter endpoint."""
    response = __get(f"{__URL}/cars/attributes/names?text=preis")
    assert response.status_code == requests.codes.ok
    attrs = response.json()
    assert attrs == ["Fahrzeugpreis", "Grundpreis"]


def test_get_attributes_values_with_int_type() -> None:
    """Test get attributes values endpoint for int type attribute."""
    response = __get(f"{__URL}/cars/attributes/values?text=Autom.%20Abstandsregelung")
    assert response.status_code == requests.codes.ok
    obj = response.json()
    assert obj["type"] == "int"
    assert "Serie" in obj["additional_values"]
    assert None in obj["additional_values"]
    obj_range = obj["range"]
    assert obj_range["min"] < 600  # noqa: PLR2004
    assert obj_range["max"] > 1000  # noqa: PLR2004


def test_get_attributes_values_list() -> None:
    """Test get attributes values endpoint for list type attribute."""
    response = __get(f"{__URL}/cars/attributes/values?text=Motorart")
    assert response.status_code == requests.codes.ok
    obj = response.json()
    assert len(obj) > 6  # noqa: PLR2004
    assert "Diesel" in obj
    assert "Otto" in obj
    assert "Elektro" in obj


def test_find_by_filter() -> None:
    """Test find by filter endpoint."""
    limit = 5
    response = __post(
        f"{__URL}/cars/findByFilter",
        {
            "page": 1,
            "limit": limit,
            "text": "vw",
            "attributes": [
                {"name": "Motorart", "values": ["Diesel"], "range": {}},
                {"name": "Autom. Abstandsregelung", "values": ["Serie"], "range": {}},
            ],
        },
    )
    obj = response.json()
    assert len(obj["docs"]) == limit
    assert obj["total"] > limit
    assert obj["limit"] == limit
    assert obj["page"] == 1
    assert obj["pages"] > 1
    assert obj["offset"] == 0

    __assert_single_car_json(obj["docs"][0])
