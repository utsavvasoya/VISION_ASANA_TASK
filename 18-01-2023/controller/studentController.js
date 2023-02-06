const studentSchema = require("../models/student");
const registerSchema = require("../models/register");
const joi = require("joi");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.addStudentMarks = async (req, res) => {
    try {
        const schema = joi.object({
            studentId: joi.string().required().label("Student id"),
            subjects: joi.array().items(joi.object({ subject: joi.string().required(), marks: joi.number().min(0).max(100).required() })).required().label("Subject")
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.json({
                message: error.message,
            });
        } else {
            let { studentId, subjects } = req.body;
            req.body.subjects.map((res) => (res.marks = Number(res.marks)))
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
                var result = [];
                result = findStudent.subjects.filter((cv) => {
                    return !subjects.find((e) => {
                        return e.subject == cv.subject;
                    });
                });
                result.map((res) => {
                    subjects.push(res);
                });
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
            async (err, data) => {
                if (err) {
                    console.log(err);
                    return res.json({
                        message: "Something went wrong.",
                    });
                }
                const getAllStudent = await studentSchema.find();
                const totalStudentLt490 = Number(((getAllStudent.length - data.length) / getAllStudent.length * 100).toFixed(2));
                return res.json({
                    data,
                    totalStudentLt490,
                    count: Number((data.length / getAllStudent.length * 100).toFixed(2)),
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
                    $unwind: {
                        path: '$subjects'
                    }
                },
                {
                    $match:
                        { "subjects.marks": { $gt: 75, $lt: 90 } }
                }, {
                    $lookup: {
                        'from': 'registers',
                        'localField': 'studentId',
                        'foreignField': '_id',
                        'as': 'result'
                    }
                }
            ],
            async (err, data) => {
                if (err) {
                    console.log(err);
                    return res.json({
                        message: "Something went wrong.",
                    });
                }
                var result = [];
                for (let i = 0; i < data.length; i++) {
                    const name = data[i].result[0].email;
                    result.push(name)
                }
                const getAllStudent = await studentSchema.find();
                const totalStudentNotBtw75to90 = Number(((getAllStudent.length - [... new Set(result)].length) / getAllStudent.length * 100).toFixed(2));
                return res.json({
                    studentBtw75to90: Number(([... new Set(result)].length / getAllStudent.length * 100).toFixed(2)),
                    totalStudentNotBtw75to90: totalStudentNotBtw75to90
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
                    $unwind: {
                        path: '$subjects'
                    }
                },
                {
                    $match: {
                        "subjects.marks": { $lte: 35 },
                        studentId: ObjectId(req.body.studentId)
                    },
                }
            ],
            async (err, data) => {
                if (err) {
                    console.log(err);
                    return res.json({
                        message: "Something went wrong.",
                    });
                }
                const findStudentById = await studentSchema.findOne({ studentId: req.body.studentId });
                var subject = findStudentById.subjects;
                if (data.length > 0) {
                    return res.json({ data, subject, Grad: "Fail" });
                } else {
                    studentSchema.aggregate(
                        [
                            {
                                $unwind: {
                                    path: '$subjects'
                                }
                            },
                            {
                                $match: {
                                    studentId: ObjectId(req.body.studentId)
                                }
                            },
                            {
                                $group: {
                                    "_id": ["$_id"],
                                    "total": { $sum: { $sum: "$subjects.marks" } }
                                }
                            }
                        ], async (err, data) => {
                            if (err) {
                                console.log(err);
                                return res.json({
                                    message: "Something went wrong.",
                                });
                            }
                            const findStudentById = await studentSchema.findOne({ studentId: req.body.studentId });
                            var subject = findStudentById.subjects;
                            if (data.length == 0) {
                                return res.json({ message: "Student not found" });
                            }
                            if (data[0].total > 375) {
                                return res.json({ data, subject, Grad: "Distinction" });
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
                    $unwind: {
                        path: '$subjects'
                    }
                }, {
                    $match:
                        { "subjects.marks": { $eq: 90 } },
                },
                {
                    $lookup: {
                        'from': 'registers',
                        'localField': 'studentId',
                        'foreignField': '_id',
                        'as': 'result'
                    }
                }, {
                    $project: {
                        "subjects.subject": 1,
                        "subjects.marks": 1,
                        "result.username": 1,
                        _id: 0,
                    }
                }
            ],
            async (err, data) => {
                if (err) {
                    console.log(err);
                    return res.json({
                        message: "Something went wrong.",
                    });
                }
                const getAllStudent = await studentSchema.find();
                const totalStudentNE90 = Number(((getAllStudent.length - data.length) / getAllStudent.length * 100).toFixed(2));
                return res.json({
                    data,
                    totalStudentNE90,
                    count: Number((data.length / getAllStudent.length * 100 ? data.length / getAllStudent.length * 100 : 0).toFixed(2)),
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

exports.getAllStudentMarks = async (req, res) => {
    try {
        const getAllStudent = await studentSchema.find();
        return res.json(getAllStudent);
    } catch {
        console.log(err);
        return res.json({
            message: "Unable to get student.",
        });
    }
}

exports.homePage = async (req, res) => {
    try {
        const data = await studentSchema.find();
        const userData = await registerSchema.find();
        res.render("home", { Data: data, UserData: userData})
    } catch {
        console.log(err);
        return res.json({
            message: "Unable to get home page."
        });
    }
}