const express = require('express');
const router = express.Router();
const studentSchema = require("../models/student");
const registerSchema = require("../models/register");
const { register, login } = require('../controller/loginController');

router.get('/register', (req, res) => {
    res.render("register")
})
router.get('/login', (req, res) => {
    res.render("login")
})
router.get('/home', async (req, res) => {
    const data = await studentSchema.find();
    const userData = await registerSchema.find();
    res.render("home", { Data: data, UserData: userData })
})
router.post('/register', register)
router.post('/login', login)

module.exports = router;