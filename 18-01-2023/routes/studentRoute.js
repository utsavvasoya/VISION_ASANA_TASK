const express = require('express');
const router = express.Router();
const { addStudentMarks, getStudentWithMarks, getStudentBtw, getStudentCard, getStudentMarksIndividual, getAllStudentMarks } = require('../controller/studentController');

router.get('/dashbord', (req, res) => {
    res.render("dashbord")
})
router.post('/addStudentMarks', addStudentMarks)
router.get('/getStudentWithMarks', getStudentWithMarks)
router.get('/getStudentMarksIndividual', getStudentMarksIndividual)
router.post('/getStudentCard', getStudentCard)
router.get('/getStudentBtw75-90', getStudentBtw)
router.get('/getAllStudentMarks', getAllStudentMarks)

module.exports = router;