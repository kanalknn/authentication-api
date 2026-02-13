const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionPlan.controller');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { subscriptionPlanValidator, downloadRecordJoiSchema } = require('../validators/subscriptionPlanValidator');
const Response = require('../responses/responses'); 
const { HTTP_BAD_REQUEST, HTTP_NOT_FOUND } = require('../constants/httpCodes');

// Validation middleware
const validateSubscriptionPlan = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return Response.joierrors(req, res, error);
    }
    next();
  };
};

const validateDownloadRecord = (req, res, next) => {
  const { error } = downloadRecordJoiSchema.validate(req.body);
  if (error) {
    return Response.joierrors(req, res, error);
  }
  next();
};

/**
 * @swagger
 * tags:
 *   name: SubscriptionPlans
 *   description: Subscription Plan management and access
 */

/**
 * @swagger
 * /api/subscription/plans:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [SubscriptionPlans]
 *     responses:
 *       200:
 *         description: List of subscription plans
 */
router.get('/plans', subscriptionController.getAllPlans);

/**
 * @swagger
 * /api/subscription/plans/{id}:
 *   get:
 *     summary: Get a subscription plan by ID
 *     tags: [SubscriptionPlans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription plan details
 *       404:
 *         description: Plan not found
 */
router.get('/plans/:id', subscriptionController.getPlanById);

/**
 * @swagger
 * /api/subscription/me:
 *   get:
 *     summary: Get current user's subscription
 *     tags: [SubscriptionPlans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's subscription info
 */
router.get('/me', auth, subscriptionController.getUserSubscription);

/**
 * @swagger
 * /api/subscription/create:
 *   post:
 *     summary: Create a subscription
 *     tags: [SubscriptionPlans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscription created
 */
router.post('/create', auth, subscriptionController.createSubscription);

/**
 * @swagger
 * /api/subscription/can-download/{assetId}:
 *   get:
 *     summary: Check if a user can download a specific asset
 *     tags: [SubscriptionPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Download permission result
 */
router.get('/can-download/:assetId', auth, subscriptionController.canDownloadAsset);

/**
 * @swagger
 * /api/subscription/record-download:
 *   post:
 *     summary: Record a download attempt
 *     tags: [SubscriptionPlans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Download recorded
 */
router.post('/record-download', auth, validateDownloadRecord, subscriptionController.recordDownload);

/**
 * @swagger
 * /api/subscription/create-plans:
 *   post:
 *     summary: Create a new subscription plan
 *     tags: [SubscriptionPlans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: number
 *     responses:
 *       201:
 *         description: Plan created
 */
router.post('/create-plans', adminAuth(), validateSubscriptionPlan(subscriptionPlanValidator.create), subscriptionController.createPlan);

/**
 * @swagger
 * /api/subscription/update-plans/{id}:
 *   put:
 *     summary: Update an existing subscription plan
 *     tags: [SubscriptionPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: number
 *     responses:
 *       200:
 *         description: Plan updated
 */
router.put('/update-plans/:id', adminAuth(), validateSubscriptionPlan(subscriptionPlanValidator.update), subscriptionController.updatePlan);

/**
 * @swagger
 * /api/subscription/init-plans:
 *   post:
 *     summary: Initialize default plans (admin only)
 *     tags: [SubscriptionPlans]
 *     responses:
 *       200:
 *         description: Plans initialized
 */
router.post('/init-plans', subscriptionController.initSubscriptionPlans);

/**
 * @swagger
 * /api/subscription/admin/all:
 *   get:
 *     summary: Get all user subscriptions (admin only)
 *     tags: [SubscriptionPlans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all subscriptions
 */
router.get('/admin/all', subscriptionController.getAllSubscriptions || ((req, res) => {
  return Response.errors(req, res, HTTP_NOT_FOUND, 'Endpoint not implemented');
}));

/**
 * @swagger
 * /api/subscription/admin/user/{userId}:
 *   get:
 *     summary: Get subscription history of a user
 *     tags: [SubscriptionPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User subscription history
 */
router.get('/admin/user/:userId', subscriptionController.getUserSubscriptionHistory || ((req, res) => {
  return Response.errors(req, res, HTTP_NOT_FOUND, 'Endpoint not implemented');
}));

/**
 * @swagger
 * /api/subscription/admin/{subscriptionId}/status:
 *   patch:
 *     summary: Update the status of a subscription
 *     tags: [SubscriptionPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, cancelled, expired]
 *     responses:
 *       200:
 *         description: Subscription status updated
 */
router.patch('/admin/:subscriptionId/status', subscriptionController.updateSubscriptionStatus || ((req, res) => {
  return Response.errors(req, res, HTTP_NOT_FOUND, 'Endpoint not implemented');
}));

router.delete('/:id',adminAuth(), subscriptionController.deletePlan);


module.exports = router;
