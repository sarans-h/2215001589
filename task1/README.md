# Average Calculator API with Upstash Redis Caching

A simple REST API that calculates the average of numbers with Redis caching using Upstash.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run at `http://localhost:3000`

## API Endpoints

### Calculate Average
- **URL:** `/calculate-average`
- **Method:** `POST`
- **Body:**
```json
{
    "numbers": [1, 2, 3, 4, 5]
}
```
- **Success Response:**
```json
{
    "result": 3,
    "count": 5,
    "cached": false
}
```
- **Cached Response:**
```json
{
    "result": 3,
    "count": 5,
    "cached": true
}
```
- **Error Response:**
```json
{
    "error": "Please provide an array of numbers"
}
```



## Features
- Calculate average of an array of numbers
- Results are cached for 1 hour using Upstash Redis
- Cache key is created on sorted numbers for consistent results

## HIT WITHOUT CACHING
[without caching](docs/image.png)

## HIT WITh CACHING
[with caching](docs/image2.png)


