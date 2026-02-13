const express = require('express');
const router = express.Router();
const giftBundleController = require('../controllers/giftBundle.controller');
const adminAuth = require('../middleware/adminAuth');

// Create a gift bundle
router.post('/create',adminAuth(), giftBundleController.createGiftBundle);

// Get all gift bundles
router.get('/', giftBundleController.getAllGiftBundles);

// Get gift bundle by ID
router.get('/:id', giftBundleController.getGiftBundleById);

// Update gift bundle
router.put('/:id',adminAuth(), giftBundleController.updateGiftBundle);

// Delete gift bundle
router.delete('/:id',adminAuth(), giftBundleController.deleteGiftBundle);

// Get gift bundles by subscription ID
router.get('/subscription/:subscriptionId', giftBundleController.getGiftBundlesBySubscription);

module.exports = router;