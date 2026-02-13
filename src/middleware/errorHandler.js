const HTTP_STATUS = require('../constants/httpCodes');
const RESPONSE_MESSAGES = require('../responses/responses');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.isJoi) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: RESPONSE_MESSAGES.VALIDATION_ERROR,
      errors: err.details,
    });
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER).json({
    success: false,
    message: RESPONSE_MESSAGES.SERVER_ERROR,
  });
};

module.exports = errorHandler;