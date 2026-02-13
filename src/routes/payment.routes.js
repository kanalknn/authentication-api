const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Stripe payment integration APIs
 */

/**
 * @swagger
 * /api/payment/create-intent:
 *   post:
 *     summary: Create a Stripe payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 example: "usd"
 *               metadata:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: Payment intent created
 */
router.post('/create-intent', auth, paymentController.createPaymentIntent);

/**
 * @swagger
 * /api/payment/confirm:
 *   post:
 *     summary: Confirm a Stripe payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed
 */
router.post('/confirm', auth, paymentController.confirmPayment);

/**
 * @swagger
 * /api/payment/webhook:
 *   post:
 *     summary: Stripe webhook for payment events
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook received
 *       400:
 *         description: Invalid payload
 */
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

/**
 * @swagger
 * /api/payment/{id}:
 *   get:
 *     summary: Get payment details by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */
router.get('/:id', auth, paymentController.getPayment);

/**
 * @swagger
 * /api/payment/user/{userId}:
 *   get:
 *     summary: Get all payments for a user
 *     tags: [Payments]
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
 *         description: List of payments
 */
router.get('/user/:userId', auth, paymentController.getUserPayments);

module.exports = router;
