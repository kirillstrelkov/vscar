"""Database connection setup."""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from pymongo import MongoClient

load_dotenv()

__MONGO_URI = os.getenv("DATABASE_URI", "mongodb://localhost:27017")
__DB_NAME = "vscar"


def __connect_to_mongo(app: FastAPI) -> None:
    """Initialize the synchronous MongoDB client."""
    app.mongo_client = MongoClient(__MONGO_URI)
    app.collection = app.mongo_client.get_database(__DB_NAME)["cars"]


def __close_mongo_connection(app: FastAPI) -> None:
    """Close the MongoDB connection."""
    app.mongo_client.close()


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ANN201
    """Context manager for db connection."""
    __connect_to_mongo(app)
    yield
    __close_mongo_connection(app)
