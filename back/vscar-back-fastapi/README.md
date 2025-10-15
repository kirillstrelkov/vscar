# FastAPI for vscar backend service

This project is a backend service built with FastAPI to provide a RESTful API for querying a car database stored in MongoDB.

## Features

- FastAPI for high-performance asynchronous request handling.
- MongoDB integration for data storage and complex queries.
- CORS middleware for frontend integration.

---

## Setup and Installation

### 1. Prerequisites

- Python 3.8+
- A running MongoDB instance.

### 2. Install Dependencies

This project uses `uv` for fast dependency management. If you don't have it, you can install it with `pip`:

```bash
pip install uv
```

Then, create a virtual environment and install the dependencies:

```bash
# Create and activate a virtual environment
uv venv
source .venv/bin/activate

# Install the required packages
uv pip install fastapi "uvicorn[standard]" pymongo python-dotenv
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project directory and add the following variables.

```env
# The connection string for your MongoDB instance
DATABASE_URI="mongodb://localhost:27017"

# The host and port the FastAPI server will run on
HOST="0.0.0.0"
PORT="3000"

# Comma-separated list of allowed origins for CORS
ALLOWED_ORIGINS="http://localhost:4200"
```

---

## Running the Application

You can run the application directly using Uvicorn:

```bash
python main.py
```

The API will be available at `http://localhost:3000`.

Interactive API documentation (provided by Swagger UI) will be available at `http://localhost:3000/docs`.
