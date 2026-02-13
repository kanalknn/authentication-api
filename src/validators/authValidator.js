const Joi = require('joi');

// ------------------
// Individual field validations
// ------------------

const emailValidation = Joi.string()
  .email()
  .required()
  .messages({
    'string.email': 'Invalid email format',
    'string.empty': 'Email is required',
  });

const passwordValidation = Joi.string()
  .min(6)
  .required()
  .messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required',
  });

const nameValidation = Joi.string()
  .min(2)
  .max(50)
  .required()
  .messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'string.empty': 'Name is required',
  });

const otpValidation = Joi.string()
  .length(6)
  .pattern(/^[0-9]+$/)
  .required()
  .messages({
    'string.length': 'OTP must be 6 digits',
    'string.pattern.base': 'OTP must contain only numbers',
    'string.empty': 'OTP is required',
  });

const phoneValidation = Joi.string()
  .pattern(/^[+]?[1-9]\d{1,14}$/)
  .optional()
  .messages({
    'string.pattern.base': 'Invalid phone number format',
  });

// ------------------
// Composite schemas for full objects
// ------------------

const registerValidation = Joi.object({
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
  phone: phoneValidation,
});

const loginValidation = Joi.object({
  email: emailValidation,
  password: passwordValidation,
});

const forgotPasswordValidation = Joi.object({
  email: emailValidation,
});

const resetPasswordValidation = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Reset token is required',
  }),
  password: passwordValidation,
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Confirm password is required',
    }),
});

const verifyOtpValidation = Joi.object({
  email: emailValidation,
  otp: otpValidation,
});

const resendOtpValidation = Joi.object({
  email: emailValidation,
});

const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required',
  }),
  newPassword: passwordValidation,
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Confirm password is required',
    }),
});

const updateProfileValidation = Joi.object({
  name: nameValidation.optional(),
  phone: phoneValidation,
  // Add other profile fields if needed
});

// ------------------
// Helper to dynamically get schema
// ------------------

const getValidationSchema = (type) => {
  switch (type.toUpperCase()) {
    case 'EMAIL': return emailValidation;
    case 'PASSWORD': return passwordValidation;
    case 'NAME': return nameValidation;
    case 'OTP': return otpValidation;
    case 'PHONE': return phoneValidation;
    default:
      throw new Error(`Unknown validation type: ${type}`);
  }
};

// ------------------
// Helper to validate object
// ------------------

const validate = (data, schemaObj) => {
  const schema = Joi.object(schemaObj);
  return schema.validate(data, { abortEarly: false });
};

// ------------------
// Exports
// ------------------

module.exports = {
  // Composite
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyOtpValidation,
  resendOtpValidation,
  changePasswordValidation,
  updateProfileValidation,

  // Individual fields
  emailValidation,
  passwordValidation,
  nameValidation,
  otpValidation,
  phoneValidation,

  // Helpers
  getValidationSchema,
  validate
};
