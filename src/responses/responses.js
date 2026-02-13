const responseStatus = require("../constants/httpCodes");
const logger = require("../utilities/logger");

class Response {
  // Success response
  success(req, res, status = 200, data = null, message = "Success",) {
    logger.info(`${req.method} ${req.originalUrl} → ${message}`);
    return res.status(status).json({
      success: true,
      status,
      message,
      data,
    });
  }

  // Failure with message and data
  fail(req, res, status = 400, message = "Error", data = null) {
    logger.warn(`${req.method} ${req.originalUrl} → ${message}`);
    return res.status(status).json({
      success: false,
      status,
      message,
      data,
    });
  }

  // Generic error response
  error(req, res, status = 500, message = "Something went wrong") {
    logger.error(`${req.method} ${req.originalUrl} → ${message}`);
    return res.status(status).json({
      success: false,
      status,
      message,
    });
  }

  // Error without request object
  errorWithoutReq(res, status = 500, message = "Internal server error") {
    return res.status(status).json({
      success: false,
      status,
      message,
    });
  }

  // Joi error response
  joiError(req, res, err) {
    const error = err.details.reduce((prev, curr) => {
      prev[curr.path[0]] = curr.message.replace(/"/g, "");
      return prev;
    }, {});
    logger.warn(`${req.method} ${req.originalUrl} → Joi Validation Error`);
    return res.status(responseStatus.HTTP_BAD_REQUEST).json({
      success: false,
      status: responseStatus.HTTP_BAD_REQUEST,
      message: "Validation Error",
      error,
    });
  }

  // Joi error with message only
  joiCustomError(req, res, err) {
    const message = err.details.map((curr) => curr.message.replace(/"/g, "")).join(", ");
    logger.warn(`${req.method} ${req.originalUrl} → Joi Custom Error`);
    return res.status(responseStatus.HTTP_BAD_REQUEST).json({
      success: false,
      status: responseStatus.HTTP_BAD_REQUEST,
      message,
    });
  }
}

module.exports = new Response();
