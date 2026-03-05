const express = require('express');
const router = express.Router();
const noteController = require('../../controllers/admin/note.controller');
const adminAuth = require('../../middleware/adminAuth');

router.post('/', adminAuth(['admin']), noteController.createNote);
router.get('/', noteController.getAllNotes);
router.get('/:id', noteController.getNoteById);
router.put('/:id', adminAuth(['admin']), noteController.updateNote);
router.delete('/:id', adminAuth(['admin']), noteController.deleteNote);

module.exports = router;
