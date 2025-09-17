# vscar-back-gin

## Overview
vscar-back-gin is a Go (Gin) implementation of the `vscar` backend, mirroring the Rocket (Rust) API. It serves car data from MongoDB and exposes search, attributes, and utility endpoints.

## Project Structure
```
vscar-back-gin
├── src
│   ├── main.go
│   ├── controllers
│   │   └── controller.go
│   ├── routes
│   │   └── routes.go
│   ├── models
│   │   └── model.go
│   ├── services
│   │   └── service.go
│   └── config
│       └── config.go
├── go.mod
├── go.sum
└── README.md
```

## Getting Started

### Prerequisites
- Go 1.18 or later
- MongoDB accessible via `DATABASE_URI` (e.g., `mongodb://localhost:27017`)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd vscar-back-gin
   ```

2. Install dependencies:
   ```
   go mod tidy
   ```

### Running the Application
Use a `.env` file or export environment variables, then run:
```
cat > .env << 'ENV'
DATABASE_URI=mongodb://localhost:27017
# optional override (default 8080)
# PORT=8080
ENV

go run ./src
```

The server starts on `http://localhost:$PORT` (default `8080`).

### API Endpoints
- `GET /` — List available routes
- `GET /cars` — First 10 cars sorted by price asc
- `GET /cars/:id` — Car by `adac_id`
- `GET /cars/db/version` — Processed date (string, truncated before dot)
- `GET /cars/attributes/names?text=<substr>` — Attribute names filtered by substring (case-insensitive)
- `GET /cars/attributes/values?text=<attrName>` — Attribute values
  - If numeric: returns object `{type, additional_values, range:{min,max}}`
  - If string: returns deduplicated sorted list of values (nullable supported)
- `POST /cars/findByFilter` — Faceted search with pagination
  - Body example:
    ```json
    {
      "page": 1,
      "limit": 20,
      "text": "golf",
      "attributes": [
        {"name": "gearbox", "values": ["automatic"], "range": null},
        {"name": "mileage", "values": [], "range": {"min": 0, "max": 80000}}
      ]
    }
    ```
  - Response example (shape):
    ```json
    {"docs": [...], "total": 123, "limit": 20, "page": 1, "pages": 7, "offset": 0}
    ```

## License
This project is licensed under the MIT License.