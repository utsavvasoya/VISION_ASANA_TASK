const express = require('express');
const router = express.Router();
const { register, login } = require('../controller/loginController');
const { homePage } = require('../controller/studentController');

router.get('/register', (req, res) => {
    res.render("register")
})
router.get('/login', (req, res) => {
    res.render("login")
})
router.get('/home', homePage)
router.post('/register', register)
router.post('/login', login)

module.exports = router;