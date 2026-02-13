const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/admin.controller');
const adminAuth = require('../../middleware/adminAuth');

router.post('/', adminAuth(['admin']), adminController.createAdmin);

router.put('/:id/role', adminAuth(['admin']), adminController.updateAdminRole);

module.exports = router;