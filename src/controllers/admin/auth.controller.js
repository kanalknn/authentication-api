const adminAuthService = require('../../services/admin/auth.service');
const tokenModel = require('../../models/token.model');
const { generateToken, decodeToken } = require('../../utilities/jwt');
const { validate, getValidationSchema } = require('../../validators/authValidator');

const Response = require("../../responses/responses");
const responseStatus = require("../../constants/httpCodes");
const responseMessages = require("../../responses/responses");

/**
 * @swagger
 * tags:
 *   name: Admin Authentication
 *   description: Admin authentication endpoints
 */

/**
 * @swagger
 * /api/admin/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Authentication]
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
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: admin123
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
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid credentials
 */
exports.login = async (req, res) => {
  try {
    // Validate input using authValidator
    const schema = {
      email: getValidationSchema('EMAIL'),
      password: getValidationSchema('PASSWORD')
    };
    const { error } = validate(req.body, schema);

    if (error) {
      return Response.error(
        req, 
        res, 
        responseStatus.HTTP_BAD_REQUEST, 
        error.details.map(d => d.message)
      );
    }

    const { email, password } = req.body;
    const admin = await adminAuthService.login(email, password);

    const token = generateToken({
      id: admin.id,
      role: admin.role.toUpperCase(),
      email: admin.email
    });

    return Response.success(
      req, 
      res, 
      responseStatus.HTTP_OK, 
      {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role
        }
      },
      responseMessages.adminLog
    );
  } catch (error) {
    return Response.error(
      req, 
      res, 
      responseStatus.HTTP_BAD_REQUEST, 
      error.message
    );
  }
};

/**
 * @swagger
 * /api/admin/auth/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       400:
 *         description: No token provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Logout failed
 */
exports.logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return Response.error(
        req, 
        res, 
        responseStatus.HTTP_BAD_REQUEST, 
        "No token provided"
      );
    }

    const { exp } = decodeToken(token);
    const expiresAt = new Date(exp * 1000);

    await tokenModel.addToBlacklist(token, expiresAt);

    return Response.success(
      req, 
      res, 
      responseStatus.HTTP_OK, 
      null, 
      "Successfully logged out"
    );
  } catch (error) {
    return Response.error(
      req, 
      res, 
      responseStatus.HTTP_INTERNAL_SERVER_ERROR, 
      error.message
    );
  }
};
