"""Database connection setup."""

import os
from collections.abc import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from pymongo import AsyncMongoClient

load_dotenv()

__MONGO_URI = os.getenv("DATABASE_URI", "mongodb://localhost:27017")
__DB_NAME = "vscar"


@asynccontextmanager
async def db_lifespan(app: FastAPI) -> AsyncGenerator[None, None, None]:
    """Database connection lifespan."""
    app.mongodb_client = AsyncMongoClient(__MONGO_URI)
    db = app.mongodb_client[__DB_NAME]
    app.collection = db.get_collection("cars")
    ping_response = await db.command("ping")
    if int(ping_response["ok"]) != 1:
        msg = "Problem connecting to database cluster."
        raise Exception(msg)  # noqa: TRY002

    yield

    await app.mongodb_client.close()
