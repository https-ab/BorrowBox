/**
 * Operational error with an HTTP status code.
 * Anything thrown as ApiError is safe to show to the user.
 */
export default class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }
  static unauthorized(message = 'Your session has expired. Please log in again.') {
    return new ApiError(401, message);
  }
  static forbidden(message = 'You are not allowed to do that.') {
    return new ApiError(403, message);
  }
  static notFound(message = 'Resource not found.') {
    return new ApiError(404, message);
  }
  static conflict(message) {
    return new ApiError(409, message);
  }
}
