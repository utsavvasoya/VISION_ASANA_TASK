const registerSchema = require("../models/register");
const bcrypt = require("bcryptjs");
const joi = require('joi');
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const schema = joi.object({
            username: joi.string().required().label("Username"),
            password: joi.string().min(6).required().label("Password"),
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().label("Email")
        })
        const { error } = schema.validate(req.body)
        if (error) {
            return res.json({
                message: error.message
            })
        } else {
            const { username, email, password } = req.body;
            const findStudent = await registerSchema.findOne({ email })
            if (findStudent) {
                return res.json({ message: "User Alredy Registerd!" });
            }
            const newStudent = new registerSchema({
                username,
                password,
                email
            });
            const salt = await bcrypt.genSalt(10);
            newStudent.password = await bcrypt.hash(newStudent.password, salt);

            await newStudent.save();
            return res.json({
                newStudent,
                message: "You are successfully registred. Please nor login."
            });
        }
    } catch (err) {
        console.log(err)
        return res.json({
            message: "Unable to create your account."
        });
    }
}


exports.login = async (req, res) => {
    try {
        const schema = joi.object({
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().label("Email"),
            password: joi.string().min(6).required().label("Password")
        })
        const { error } = schema.validate(req.body)
        if (error) {
            return res.json({
                message: error.message
            })
        } else {
            let { email, password } = req.body;
            const findStudent = await registerSchema.findOne({ email });
            if (!findStudent) {
                return res.json({
                    message: "Email is not found. Invalid login credentials."
                });
            }
            let ismatch = await bcrypt.compare(password, findStudent.password);
            if (ismatch) {
                let token = jwt.sign(
                    {
                        student_id: findStudent._id,
                        email: findStudent.email,
                    },
                    process.env.TOKEN_SECRET,
                    { expiresIn: "7 days" }
                );

                let result = {
                    data: findStudent,
                    token: `Bearer ${token}`,
                };
                return res.json({
                    Login: result,
                    message: "You are now logged in."
                });
            } else {
                return res.json({
                    message: "Incorrect password."
                });
            }
        }
    } catch (err) {
        console.log(err)
        return res.json({
            message: "Unable to login."
        });
    }
}