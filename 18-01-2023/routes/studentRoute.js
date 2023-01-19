const express = require('express');
const router = express.Router();

const { register, login } = require('../controller/loginController')
const { addStudent, getStudentWithMarks, getStudentBtw, getStudentCard } = require('../controller/studentController')

router.post('/register', register)
router.post('/login', login)
router.post('/addStudent', addStudent)
router.get('/getStudentWithMarks', getStudentWithMarks)
router.get('/getStudentBtw75-90', getStudentBtw)
router.get('/getStudentCard', getStudentCard)

module.exports = router;