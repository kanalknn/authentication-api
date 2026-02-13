const response = require('../responses/responses');
const httpCodes = require('../constants/httpCodes');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details[0].message;
      return response.errors(req, res, httpCodes.HTTP_BAD_REQUEST, errorMessage);
    }
    
    next();
  };
};

module.exports = validateRequest;