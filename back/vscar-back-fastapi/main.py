"""FastAPI vscar backend service."""

import os
from typing import Any

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, RedirectResponse

from db import lifespan

app = FastAPI(lifespan=lifespan)
load_dotenv()

__PROJECTION_SKIP_ID = {"_id": False}
__LIMIT = 100

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.8:4200",
        *os.getenv("ALLOWED_ORIGINS", "").split(","),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/cars/findByFilter")
def find_by_filter(query: dict[str, Any]):  # noqa: ANN201
    """Find cars by filter."""
    page = int(query.get("page", 1))
    text = query.get("text", "")
    limit = int(query.get("limit", __LIMIT))

    limit = min(limit, __LIMIT)

    db_query = {}
    attr_queries = []

    for attr_data in query.get("attributes", []):
        key = attr_data.get("name")
        values = attr_data.get("values", [])
        range_data = attr_data.get("range", {})

        range_min = range_data.get("min")
        range_max = range_data.get("max")

        attr_query_list = []

        if range_min is not None and range_max is not None:
            try:
                min_val = int(range_min)
                max_val = int(range_max)

                attr_query_list.append(
                    {
                        "attributes": {
                            "$elemMatch": {
                                "name": key + "|fixed",
                                "value": {
                                    "$gte": min_val,
                                    "$lte": max_val,
                                },
                            },
                        },
                    }
                )
            except (ValueError, TypeError):
                pass

        if len(values) > 0:
            mapped_values = [v if v != "null" else None for v in values]

            attr_query_list.append(
                {
                    "attributes": {
                        "$elemMatch": {
                            "name": key,
                            "value": {
                                "$in": mapped_values,
                            },
                        },
                    },
                }
            )

        if len(attr_query_list) > 0:
            attr_queries.append({"$or": attr_query_list})

    if attr_queries:
        db_query["$and"] = attr_queries

    if text:
        db_query["name"] = {"$regex": text, "$options": "i"}

    skip = (page - 1) * limit

    pipeline = [
        {"$project": __PROJECTION_SKIP_ID},
        {"$match": db_query},
        {"$sort": {"price": 1}},
        {
            "$facet": {
                "paginatedResults": [{"$skip": skip}, {"$limit": limit}],
                "totalCount": [{"$count": "total"}],
            },
        },
    ]

    paginated_data = list(app.collection.aggregate(pipeline))

    if not paginated_data or not paginated_data[0].get("totalCount"):
        return {
            "docs": [],
            "total": 0,
            "limit": limit,
            "page": page,
            "pages": 0,
            "offset": 0,
            "hasPrevPage": False,
            "hasNextPage": False,
            "totalPages": 0,
            "pagingCounter": 0,
            "prevPage": None,
            "nextPage": None,
        }

    facet_data = paginated_data[0]

    paginated_results = facet_data.get("paginatedResults", [])
    total_count = facet_data.get("totalCount", [{}])[0].get("total", 0)

    total_pages = total_count // limit + (1 if total_count % limit > 0 else 0)
    offset = (page - 1) * limit

    return {
        "docs": paginated_results,
        "total": total_count,
        "limit": limit,
        "page": page,
        "pages": total_pages,
        "offset": offset,
        "totalDocs": total_count,
        "hasPrevPage": page > 1,
        "hasNextPage": page < total_pages,
        "totalPages": total_pages,
        "pagingCounter": offset + 1,
        "prevPage": page - 1 if page > 1 else None,
        "nextPage": page + 1 if page < total_pages else None,
    }


@app.get("/cars/attributes/names")
def get_attribute_names(text: str = "") -> list[str]:
    """Get attribute names."""
    document = app.collection.find_one({})

    if not document:
        return []

    attributes = document.get("attributes", [])

    search_lower = text.lower()
    filtered_names = []

    for attr in attributes:
        name = attr.get("name")
        if name and isinstance(name, str):
            if name.lower().endswith("fixed"):
                continue

            if search_lower in name.lower():
                filtered_names.append(name)

    filtered_names.sort()

    return filtered_names


@app.get("/cars/attributes/values")
def get_attribute_values(text: str):  # noqa: ANN201
    """Get attribute values."""
    projection = {"_id": 0, "attributes": {"$elemMatch": {"name": text}}}

    doc_metadata = app.collection.find_one({}, projection)

    if not doc_metadata or not doc_metadata.get("attributes"):
        return []

    attribute_data = doc_metadata["attributes"][0]
    column_data = attribute_data.get("column_data")
    data_type = column_data.get("type")

    if data_type == "str":
        pipeline = [
            {
                "$project": {
                    "_id": 0,
                    "attributes": {
                        "$filter": {
                            "input": "$attributes",
                            "as": "attr",
                            "cond": {"$eq": ["$$attr.name", text]},
                        },
                    },
                },
            },
            {
                "$group": {
                    "_id": "$attributes.value",
                },
            },
        ]

        cursor = app.collection.aggregate(pipeline)
        results = cursor.to_list(length=None)

        flat_values = []
        for item in results:
            if isinstance(item.get("_id"), list):
                flat_values.extend(item["_id"])

        return sorted(set(flat_values), key=lambda x: (x is None, x))

    if isinstance(column_data, dict) and column_data.get("values"):
        return column_data["values"]

    return column_data if column_data is not None else []


@app.get("/cars/db/version", response_class=PlainTextResponse)
def get_db_version() -> str:
    """Get current DB version."""
    car = app.collection.find_one()
    return car["processed_date"].split(".")[0]


@app.get("/cars")
def get_cars():  # noqa: ANN201
    """Get all cars."""
    return app.collection.find(
        projection=__PROJECTION_SKIP_ID,
        limit=10,
        sort=[
            ("price", 1),
        ],
    ).to_list()


@app.get("/cars/{id}")
def get_car(id: int):  # noqa: A002, ANN201
    """Get car by id."""
    return app.collection.find_one(
        {"adac_id": id},
        projection=__PROJECTION_SKIP_ID,
    )


@app.get("/")
def get_root():  # noqa: ANN201
    """Redirect to docs."""
    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),  # noqa: S104
        port=int(os.getenv("PORT", "3000")),
        reload=True,
    )
