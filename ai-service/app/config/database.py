import logging
import os
from typing import Optional

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database

load_dotenv()

logger = logging.getLogger(__name__)

_client: Optional[MongoClient] = None
_database: Optional[Database] = None


def _get_mongo_uri() -> str:
    return os.getenv("MONGODB_URI") or ""


def get_database_name() -> str:
    return os.getenv("MONGODB_DB_NAME", "careercraft-ai")


def connect_database() -> Database:
    global _client, _database

    if _database is not None:
        return _database

    mongo_uri = _get_mongo_uri()
    if not mongo_uri:
        raise RuntimeError("MongoDB connection string is not configured")

    _client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000, maxPoolSize=10)
    _client.admin.command("ping")
    _database = _client[get_database_name()]
    logger.info("Connected to MongoDB database: %s", get_database_name())
    return _database


def get_database() -> Optional[Database]:
    return _database


def get_database_status() -> dict:
    if _client is None or _database is None:
        return {
            "connected": False,
            "database": get_database_name(),
            "host": None,
        }

    return {
        "connected": True,
        "database": _database.name,
        "host": _client.address[0] if getattr(_client, "address", None) else None,
    }


def close_database() -> None:
    global _client, _database
    if _client is not None:
        _client.close()
    _client = None
    _database = None
