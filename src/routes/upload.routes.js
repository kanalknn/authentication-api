const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const adminAuth = require('../middleware/adminAuth');
const { uploadMiddleware } = require('../middleware/fileUpload');
const { validateUploadRequest } = require('../middleware/fileUpload');

router.post(
  '/images',
  validateUploadRequest,
  uploadMiddleware,
  adminAuth(),
  uploadController.uploadImage
);
module.exports = router;
