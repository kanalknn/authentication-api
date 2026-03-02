const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/admin/student.controller');
const adminAuth = require('../../middleware/adminAuth');

router.post('/', adminAuth(['admin']), studentController.createStudent);
router.get('/', adminAuth(['admin']), studentController.getAllStudents);
router.get('/:id', adminAuth(['admin']), studentController.getStudentById);
router.put('/:id', adminAuth(['admin']), studentController.updateStudent);
router.delete('/:id', adminAuth(['admin']), studentController.deleteStudent);

module.exports = router;
