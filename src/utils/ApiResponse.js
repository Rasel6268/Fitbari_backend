/**
 * Standardized API JSON Response Envelope
 */
class ApiResponse {
  constructor(statusCode, message = "Success", data = null, meta = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
    if (meta !== null) {
      this.meta = meta;
    }
  }

  static success(res, message = "Success", data = null, meta = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data, meta));
  }

  static created(res, message = "Created successfully", data = null, meta = null) {
    return res.status(201).json(new ApiResponse(201, message, data, meta));
  }
}

module.exports = ApiResponse;

