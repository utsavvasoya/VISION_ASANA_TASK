const express = require('express');
const router = express.Router();
const { addStudentMarks, getStudentWithMarks, getStudentBtw, getStudentCard, getStudentMarksIndividual, getAllStudentMarks } = require('../controller/studentController');
const { verifyStudent } = require('../middleware/studentAuth');

router.post('/addStudentMarks', verifyStudent, addStudentMarks)
router.get('/getStudentWithMarks', getStudentWithMarks)
router.get('/getStudentMarksIndividual', getStudentMarksIndividual)
router.get('/getStudentCard', getStudentCard)
router.get('/getStudentBtw75-90', getStudentBtw)
router.get('/getAllStudentMarks', getAllStudentMarks)

module.exports = router;