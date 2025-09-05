# Alias Forwarding Bridge

A simple web service that logs all incoming requests with detailed information including headers, body, query parameters, and more.

## Features

- 📝 **Comprehensive Logging**: Logs all request details including headers, body, query params, cookies
- 🔄 **Echo Endpoint**: `/echo` returns the complete request data as JSON
- 🏥 **Health Check**: `/health` endpoint for monitoring
- 🚨 **Catch-All**: Handles any route and logs everything
- 📊 **Raw Data Support**: Handles both JSON and raw binary data
- 🍪 **Cookie Support**: Parses and logs cookies

## Quick Start

1. **Install dependencies:**

   ```bash
   cd alias-forwarding-bridge
   npm install
   ```

2. **Start the server:**

   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

3. **Server will start on port 3002** (or PORT environment variable)

## Endpoints

### Health Check

```
GET /health
```

Returns server status and uptime information.

### Echo Endpoint

```
ANY /echo
```

Returns the complete request data as JSON response.

### V2 Anchors Endpoint

```
GET /v2/anchors
```

Returns a mock list of anchors with pagination support. Logs all query parameters.

**Query Parameters:**

- `limit`: Number of results per page (default: 10)
- `offset`: Number of results to skip (default: 0)

### Catch-All

```
ANY /*
```

Logs all requests and returns a simple acknowledgment.

## Example Usage

### Test with curl:

```bash
# Simple GET request
curl http://localhost:3002/test

# POST with JSON data
curl -X POST http://localhost:3002/api/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World", "data": [1,2,3]}'

# POST with custom headers
curl -X POST http://localhost:3002/webhook \
  -H "X-Custom-Header: my-value" \
  -H "Authorization: Bearer token123" \
  -d '{"event": "test"}'

# Test echo endpoint
curl -X POST http://localhost:3002/echo \
  -H "Content-Type: application/json" \
  -d '{"echo": "this data"}'

# Test v2 anchors endpoint
curl http://localhost:3002/v2/anchors

# Test v2 anchors with query parameters
curl "http://localhost:3002/v2/anchors?limit=5&offset=0"
```

### Test with browser:

- Visit `http://localhost:3002/health` for health check
- Visit `http://localhost:3002/echo` to see request details
- Visit `http://localhost:3002/v2/anchors` to see mock anchors data
- Visit any other URL to see logging in action

## Logging Output

The service logs detailed information for every request:

```
====================================================================================================
🕐 TIMESTAMP: 2025-01-14T10:30:45.123Z
📡 REQUEST: POST /api/webhook
🌐 PROTOCOL: http
🏠 HOST: localhost:3002
📍 IP: ::1
👤 USER-AGENT: curl/7.68.0
📏 CONTENT-LENGTH: 25
🎯 CONTENT-TYPE: application/json

📋 HEADERS:
{
  "host": "localhost:3002",
  "user-agent": "curl/7.68.0",
  "accept": "*/*",
  "content-type": "application/json",
  "content-length": "25"
}

📦 REQUEST BODY:
{
  "message": "Hello World"
}
====================================================================================================
```

## Environment Variables

- `PORT`: Server port (default: 3002)

## Use Cases

- 🔍 **API Testing**: Log all requests to your API
- 🐛 **Debugging**: See exactly what data is being sent
- 📊 **Webhook Testing**: Capture webhook payloads
- 🔄 **Request Forwarding**: Log before forwarding to another service
- 📝 **Development**: Monitor all traffic during development

## Notes

- All requests are logged to the console
- The service handles any HTTP method (GET, POST, PUT, DELETE, etc.)
- Supports both JSON and raw binary data
- No data is stored permanently - everything is just logged
- Perfect for development and testing scenarios
