const Joi = require('joi');
const jwt = require('jsonwebtoken');

const userAuthService = require('../../services/user/auth.service');
const userModel = require('../../models/user.model');
const tokenModel = require('../../models/token.model');
const emailService = require('../../services/emailService');

const { generateToken } = require('../../utilities/jwt');
const { verifyGoogleToken } = require('../../utilities/googleAuth');

const response = require("../../responses/responses");
const responseStatus = require("../../constants/httpCodes");
const { validate, getValidationSchema } = require('../../validators/authValidator');

// In-memory storage for pending signups (consider using Redis in production)
const pendingSignups = new Map();

/**
 * @swagger
 * tags:
 *   name: User Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/user/auth/google:
 *   post:
 *     summary: User login with Google
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *       400:
 *         description: Invalid Google token
 */
exports.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    const googleUser = await verifyGoogleToken(token);
    const user = await userAuthService.findOrCreateUserByGoogle(googleUser);
    
    const jwtToken = generateToken({ id: user.id, role: 'user' });

    return response.success(
      req, 
      res, 
      responseStatus.HTTP_OK, 
      {
        token: jwtToken,
        user: { id: user.id, email: user.email, name:user.name }
      }, 
      "Google login successful"
    );
  } catch (error) {
    console.error('Google login error:', error);
    return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, error.message);
  }
};

/**
 * @swagger
 * /api/user/auth/email:
 *   post:
 *     summary: User login with email/password
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: user123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *       400:
 *         description: Invalid credentials
 */
exports.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userAuthService.loginWithEmail(email, password);

    const token = generateToken({ id: user.id, role: 'user' });

    return response.success(
      req, 
      res, 
      responseStatus.HTTP_OK, 
      {
        token,
        user: { id: user.id, email: user.email, name: user.name }
      }, 
      "Login successful"
    );
  } catch (error) {
    console.error('Email login error:', error);
    return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, error.message);
  }
};

/**
 * @swagger
 * /api/user/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [User Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       400:
 *         description: No token provided
 *       500:
 *         description: Logout failed
 */
exports.logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, "No token provided");
    }

    const { exp } = jwt.decode(token);
    const expiresAt = new Date(exp * 1000);

    await tokenModel.addToBlacklist(token, expiresAt);

    return response.success(req, res, responseStatus.HTTP_OK, null, "Successfully logged out");
  } catch (error) {
    console.error('Logout error:', error);
    return response.error(req, res, responseStatus.HTTP_INTERNAL_SERVER_ERROR, "Logout failed");
  }
};



/**
 * @swagger
 * /api/user/signup:
 *   post:
 *     summary: User signup with email verification (sends OTP, stores data temporarily)
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: OTP sent for verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 signupToken:
 *                   type: string
 *       400:
 *         description: Validation error or user exists
 *       500:
 *         description: Internal server error
 */
exports.signup = async (req, res) => {
  try {
    const schema = {
      email: getValidationSchema("EMAIL"),
      password: getValidationSchema("PASSWORD"),
      name: getValidationSchema("NAME"),
    };
    const { error } = validate(req.body, schema);
    if (error) {
      return response.joiCustomError(req, res, error);
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return response.fail(req, res, responseStatus.HTTP_CONFLICT, "User already exists, try logging in");
    }

    // Generate OTP and signup token
    const otp = require('otp-generator').generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const signupToken = require('crypto').randomBytes(32).toString('hex');

    // Store signup data temporarily (expires in 15 minutes)
    const signupData = {
      email,
      password,
      name,
      otp,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes for OTP
    };

    pendingSignups.set(signupToken, signupData);

    // Send OTP email
    await emailService.sendOTPEmail(email, otp);

    return response.success(
      req, 
      res, 
      responseStatus.HTTP_CREATED, 
      { signupToken, name }, 
      "OTP sent to email for verification"
    );
  } catch (err) {
    console.error("Signup error:", err);
    return response.error(req, res, responseStatus.HTTP_INTERNAL_SERVER_ERROR, "Failed to initiate signup process");
  }
};


/**
 * @swagger
 * /api/user/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and create user account
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - signupToken
 *               - otp
 *             properties:
 *               signupToken:
 *                 type: string
 *                 description: Signup token from signup response
 *               otp:
 *                 type: string
 *                 description: OTP code
 *     responses:
 *       201:
 *         description: Account created and verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Internal server error
 */
exports.verifyOTP = async (req, res) => {
  try {
    const schema = {
      signupToken: Joi.string().required(),
      otp: getValidationSchema("OTP"),
    };
    const { error } = validate(req.body, schema);
    if (error) {
      return response.joiCustomError(req, res, error);
    }

    const { signupToken, otp } = req.body;
    
    // Get signup data from memory
    const signupData = pendingSignups.get(signupToken);
    if (!signupData) {
      return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, "Invalid or expired signup session");
    }

    // Check if signup session expired
    if (signupData.expiresAt < new Date()) {
      pendingSignups.delete(signupToken);
      return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, "Signup session expired");
    }

    // Check if OTP expired
    if (signupData.otpExpiresAt < new Date()) {
      return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, "OTP expired");
    }

    // Verify OTP
    if (signupData.otp !== otp) {
      return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, "Invalid OTP");
    }

    // Check again if user was created in the meantime
    const existingUser = await userModel.findUserByEmail(signupData.email);
    if (existingUser) {
      pendingSignups.delete(signupToken);
      return response.fail(req, res, responseStatus.HTTP_CONFLICT, "User already exists");
    }

    // Create the user
    const user = await userModel.createUserWithEmail(signupData.email, signupData.password, signupData.name);

    // Clean up signup data
    pendingSignups.delete(signupToken);

    // Generate JWT token for the newly created user
    const token = generateToken({ id: user.id, role: 'user' });

    return response.success(
      req, 
      res, 
      responseStatus.HTTP_CREATED, 
      {
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name 
        }
      }, 
      "Account created and verified successfully"
    );
  } catch (err) {
    console.error("OTP verification error:", err);
    return response.error(req, res, responseStatus.HTTP_INTERNAL_SERVER_ERROR, "Failed to verify OTP");
  }
};



/**
 * @swagger
 * /api/user/auth/resend-otp:
 *   post:
 *     summary: Resend OTP for signup verification
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - signupToken
 *             properties:
 *               signupToken:
 *                 type: string
 *                 description: Signup token from signup response
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Invalid or expired signup session
 *       500:
 *         description: Internal server error
 */
exports.resendOTP = async (req, res) => {
  try {
    const schema = {
      signupToken: Joi.string().required(),
    };
    const { error } = validate(req.body, schema);
    if (error) {
      return response.joiCustomError(req, res, error);
    }

    const { signupToken } = req.body;
    
    const signupData = pendingSignups.get(signupToken);
    if (!signupData) {
      return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, "Invalid or expired signup session");
    }

    if (signupData.expiresAt < new Date()) {
      pendingSignups.delete(signupToken);
      return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, "Signup session expired");
    }

    // Generate new OTP
    const newOTP = require('otp-generator').generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Update OTP and expiry
    signupData.otp = newOTP;
    signupData.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    pendingSignups.set(signupToken, signupData);

    // Send new OTP
    await emailService.sendOTPEmail(signupData.email, newOTP);

    return response.success(req, res, responseStatus.HTTP_OK, null, "OTP resent successfully");
  } catch (err) {
    console.error("Resend OTP error:", err);
    return response.error(req, res, responseStatus.HTTP_INTERNAL_SERVER_ERROR, "Failed to resend OTP");
  }
};

// Cleanup function to remove expired pending signups (call this periodically)
const cleanupExpiredSignups = () => {
  const now = new Date();
  for (const [token, data] of pendingSignups.entries()) {
    if (data.expiresAt < now) {
      pendingSignups.delete(token);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredSignups, 5 * 60 * 1000);