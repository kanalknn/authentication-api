const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscription management APIs
 */

/**
 * @swagger
 * /api/subscription/{id}:
 *   get:
 *     summary: Get a subscription by ID
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription data
 *       404:
 *         description: Subscription not found
 */
router.get('/:id', subscriptionController.getSubscription);

/**
 * @swagger
 * /api/subscription:
 *   post:
 *     summary: Create a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscription created
 *       400:
 *         description: Invalid input
 */
router.post('/', auth, subscriptionController.createSubscription);

/**
 * @swagger
 * /api/subscription/user/{userId}:
 *   get:
 *     summary: Get all subscriptions for a user
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user subscriptions
 */
router.get('/user/:userId', auth, subscriptionController.getUserSubscriptions);

/**
 * @swagger
 * /api/subscription/user/{userId}/stats:
 *   get:
 *     summary: Get subscription statistics for a user
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Subscription statistics
 */
router.get('/user/:userId/stats', auth, subscriptionController.getSubscriptionStats);

/**
 * @swagger
 * /api/subscription/{id}/cancel:
 *   patch:
 *     summary: Cancel a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription cancelled
 *       404:
 *         description: Subscription not found
 */
router.patch('/:id/cancel', auth, subscriptionController.cancelSubscription);

/**
 * @swagger
 * /api/subscription/all:
 *   get:
 *     summary: Get all subscriptions (Admin only)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all subscriptions
 */
router.get('/all', adminAuth(), subscriptionController.getAllSubscriptions);

/**
 * @swagger
 * /api/subscription/{id}:
 *   put:
 *     summary: Update a subscription (Admin only)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               planId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription updated
 *       404:
 *         description: Subscription not found
 */
router.put('/:id', adminAuth(), subscriptionController.updateSubscription);

/**
 * @swagger
 * /api/subscription/{id}:
 *   delete:
 *     summary: Cancel (delete) a subscription (Admin only)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription cancelled
 *       404:
 *         description: Subscription not found
 */
router.delete('/:id', adminAuth(), subscriptionController.cancelSubscription);

module.exports = router;
