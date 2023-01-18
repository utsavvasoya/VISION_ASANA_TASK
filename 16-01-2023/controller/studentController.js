const joi = require('joi');
const studentSchema = require('../models/student');
const citySchema = require('../models/city');
const stateSchema = require('../models/state');
exports.getStudent = async (req, res) => {
    try {
        const findStudent = await studentSchema.find();
        if (!findStudent) {
            return res.json({
                message: "Unable to get student.", success: false
            })
        }
        return res.json({
            Students: findStudent,
            message: "Student get successfully", success: true
        })
    } catch (err) {
        console.log(err)
        return res.json({
            message: "Unable to get student.",
            success: false
        });
    }
}

exports.createStudent = async (req, res) => {
    try {
        const schema = joi.object({
            name: joi.string().required().label("Name"),
            address: joi.string().max(100).required().label("Address"),
            class: joi.number().valid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12).required().label("Class"),
            age: joi.number().required().label("Age"),
            hobbies: joi.array().items(joi.string()).required().label("Hobbies"),
            gender: joi.string().valid('male', 'female', 'other').required().label("Gender"),
            stateId: joi.string().required().label("StateId"),
            cityId: joi.string().required().label("CityId"),
            pincode: joi.string().max(6).required().label("Pincode")
        })
        const { error } = schema.validate(req.body)
        if (error) {
            return res.json({
                message: error.message, success: false
            })
        } else if (!req.file) {
            return res.json({
                message: "Please Select Photo", success: false
            })
        } else {
            const getState = await stateSchema.find({ id: req.body.stateId });
            if (getState.length == 0) {
                return res.json({ message: "Enter Valid State Id", success: false });
            }
            const getCity = await citySchema.find({
                id: req.body.cityId,
                state_id: req.body.stateId,
            });
            if (getCity.length == 0) {
                return res.json({ message: "Enter Valid City Id", success: false });
            }
            const createStudent = new studentSchema({
                photo: req.file.filename,
                name: req.body.name,
                address: req.body.address,
                class: req.body.class,
                age: req.body.age,
                hobbies: req.body.hobbies,
                gender: req.body.gender,
                stateId: req.body.stateId,
                cityId: req.body.cityId,
                pincode: req.body.pincode,
            });
            await createStudent.save();
            return res.json({
                studentData: createStudent,
                message: "Student created successfully.",
                success: true
            });
        }
    } catch (err) {
        console.log(err)
        return res.json({
            message: "Unable to create student.",
            success: false
        });
    }
}

exports.updateStudent = async (req, res) => {
    try {
        const schema = joi.object({
            name: joi.string().optional().label("Name"),
            address: joi.string().max(100).optional().label("Address"),
            class: joi.number().valid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12).optional().label("Class"),
            age: joi.number().optional().label("Age"),
            hobbies: joi.array().items(joi.string()).optional().label("Hobbies"),
            gender: joi.string().valid('male', 'female', 'other').optional().label("Gender"),
            stateId: joi.string().optional().label("StateId"),
            cityId: joi.string().optional().label("CityId"),
            pincode: joi.string().max(6).optional().label("Pincode")
        })
        const { error } = schema.validate(req.body)
        if (error) {
            return res.json({
                message: error.message, success: false
            })
        } else {
            const updateStudent = await studentSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updateStudent) return res.json({
                message: "Enter valid student id.",
                success: false
            });
            if (req.body.stateId) {
                const getState = await stateSchema.find({ id: req.body.stateId });
                if (getState.length == 0) {
                    return res.json({ message: "Enter Valid State Id", success: false });
                }
                const getCity = await citySchema.find({
                    id: req.body.cityId,
                    state_id: req.body.stateId,
                });
                if (getCity.length == 0) {
                    return res.json({ message: "Enter Valid City Id", success: false });
                }
            }
            if (req.file) {
                updateStudent.photo = req.file.filename
            }
            await updateStudent.save();
            return res.json({
                Student: updateStudent,
                message: "Student update successfully", success: true
            })
        }
    } catch (err) {
        console.log(err)
        return res.json({
            message: "Unable to update student.",
            success: false
        });
    }
}

exports.deleteStudent = async (req, res) => {
    try {
        const deleteStudent = await studentSchema.findByIdAndDelete(req.params.id);
        if (!deleteStudent) {
            return res.json({ message: "Student Not Found.", success: false });
        }
        return res.json({
            message: "Student deleted successfully", success: true
        });
    } catch (err) {
        console.log(err)
        return res.json({
            message: "Unable to delete student.",
            success: false
        });
    }
}