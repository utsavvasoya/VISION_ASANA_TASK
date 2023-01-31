const jwt = require('jsonwebtoken');

exports.verifyStudent = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.json({ message: "Please enter token." })
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.json({ message: "Token error" })
        req.user = user
        next()
    })
}