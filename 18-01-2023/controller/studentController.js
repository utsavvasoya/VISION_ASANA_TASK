const studentSchema = require("../models/student");
const registerSchema = require("../models/register");
const joi = require("joi");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.addStudent = async (req, res) => {
    try {
        const schema = joi.object({
            studentId: joi.string().required().label("Student id"),
            subjects: joi.array().items({ subject: joi.string().required(), marks: joi.number().min(0).max(100).required() }).required().label("Subject")
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.json({
                message: error.message,
            });
        } else {
            let { studentId, subjects } = req.body;
            const newStudent = new studentSchema({
                studentId,
                subjects
            });
            const findStudentById = await registerSchema.findOne({ _id: studentId });
            if (!findStudentById) {
                return res.json({
                    message: "Enter valid student id.",
                });
            }
            const findStudent = await studentSchema.findOne({ studentId });
            if (findStudent) {
                const updateStudent = await studentSchema.findByIdAndUpdate(
                    findStudent.id,
                    req.body,
                    { new: true }
                );
                if (!updateStudent) {
                    return res.json({
                        message: "Unable to update student.",
                    });
                }
                return res.json({
                    updateStudent,
                    message: "Student updated successfully.",
                });
            }
            await newStudent.save();
            return res.json({
                newStudent,
                message: "Student created successfully.",
            });
        }
    } catch (err) {
        console.log(err);
        return res.json({
            message: "Unable to add student.",
        });
    }
};

exports.getStudentWithMarks = async (req, res) => {
    try {
        studentSchema.aggregate(
            [
                {
                    $unwind: {
                        path: '$subjects'
                    }
                },
                {
                    $group: {
                        "_id": ["$_id"],
                        "total": { $sum: { $sum: "$subjects.marks" } }
                    }
                },
                { $match: { total: { $gt: 490 } } },
            ],
            (err, data) => {
                if (err) {
                    console.log(err);
                    return res.json({
                        message: "Something went wrong.",
                    });
                }
                return res.json({
                    data,
                    count: data.length,
                    message: "Student get successfully.",
                });
            }
        );
    } catch (err) {
        console.log(err);
        return res.json({
            message: "Unable to add student.",
        });
    }
};

exports.getStudentBtw = async (req, res) => {
    try {
        studentSchema.aggregate(
            [
                {
                    $match: {
                        $or: [
                            { maths: { $gt: 75, $lt: 90 } },
                            { gujarati: { $gt: 75, $lt: 90 } },
                            { hindi: { $gt: 75, $lt: 90 } },
                            { science: { $gt: 75, $lt: 90 } },
                            { english: { $gt: 75, $lt: 90 } },
                        ],
                    },
                }, {
                    $lookup: {
                        'from': 'registers',
                        'localField': 'studentId',
                        'foreignField': '_id',
                        'as': 'result'
                    }
                }
            ],
            (err, data) => {
                if (err) {
                    console.log(err);
                    return res.json({
                        message: "Something went wrong.",
                    });
                }
                var result = [];
                for (let i = 0; i < data.length; i++) {
                    const name = data[i].result[0].username;
                    result.push(name)
                }
                return res.json({
                    name: result,
                    count: data.length
                });
            }
        );
    } catch (err) {
        console.log(err);
        return res.json({
            message: "Unable to add student.",
        });
    }
};

exports.getStudentCard = async (req, res) => {
    try {
        studentSchema.aggregate(
            [
                {
                    $match: {
                        $or: [
                            { maths: { $lte: 35 } },
                            { gujarati: { $lte: 35 } },
                            { hindi: { $lte: 35 } },
                            { science: { $lte: 35 } },
                            { english: { $lte: 35 } },
                        ],
                        studentId: ObjectId(req.body.studentId)
                    },
                }
            ],
            (err, data) => {
                if (err) {
                    console.log(err);
                    return res.json({
                        message: "Something went wrong.",
                    });
                }
                if (data.length > 0) {
                    return res.json({ Grad: "Fail" });
                } else {
                    studentSchema.aggregate(
                        [
                            {
                                $match: {
                                    studentId: ObjectId(req.body.studentId)
                                }
                            },
                            {
                                $addFields: {
                                    total: {
                                        $sum: {
                                            $add: ["$english", "$maths", "$hindi", "$gujarati", "$science"],
                                        },
                                    },
                                },
                            }
                        ], (err, data) => {
                            if (err) {
                                console.log(err);
                                return res.json({
                                    message: "Something went wrong.",
                                });
                            }
                            if (data[0].total > 375) {
                                return res.json({ data, Grad: "Distinction" });
                            }
                            return res.json({ data, msg: "Student pass" });
                        })
                }

            }
        );
    } catch (err) {
        console.log(err);
        return res.json({
            message: "Unable to add student.",
        });
    }
};

exports.getStudentMarksIndividual = async (req, res) => {
    try {
        studentSchema.aggregate(
            [
                {
                    $lookup: {
                        'from': 'registers',
                        'localField': 'studentId',
                        'foreignField': '_id',
                        'as': 'result'
                    }
                }, {
                    $match: {
                        $or: [
                            { maths: { $eq: 90 } },
                            { gujarati: { $eq: 90 } },
                            { hindi: { $eq: 90 } },
                            { science: { $eq: 90 } },
                            { english: { $eq: 90 } },
                        ],
                    }
                }
            ],
            (err, data) => {
                if (err) {
                    console.log(err);
                    return res.json({
                        message: "Something went wrong.",
                    });
                }
                var response = [];
                data.forEach((e) => {
                    var subejct = []
                    Object.keys(e).find((k) => {
                        if (e[k] == 90) {
                            subejct.push(k)
                        }
                    });
                    if (subejct.length) {
                        response.push({
                            mark: 90,
                            subject: subejct,
                            name: e.result[0].username
                        })
                    }
                });
                return res.json(response);
            }
        );
    } catch (err) {
        console.log(err);
        return res.json({
            message: "Unable to add student.",
        });
    }
};