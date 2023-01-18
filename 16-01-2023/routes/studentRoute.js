const express = require('express');
const multer = require('multer');
const router = express.Router();

const { getStudent, createStudent, updateStudent, deleteStudent } = require('../controller/studentController')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
var imageStore = multer({
    storage: storage
});

router.get('/getStudent', getStudent)
router.post('/createStudent', imageStore.single('photo'), createStudent)
router.put('/updateStudent/:id', imageStore.single('photo'), updateStudent)
router.delete('/deleteStudent/:id', deleteStudent)

module.exports = router;