// This function will get called before all of our request
// handlers and log the request.
export function logRequest(req, res, next) {
  // Skip logging for PUT requests to reduce log noise
  if (req.method !== "PUT") {
    console.log(`RECEIVED ${req.method} ${req.url}`);
    console.log(JSON.stringify(req.body, null, 2));
  }
  next();
}
