const jwt = require('jsonwebtoken');


//Authorization
const authorization = async (req, res, next) => {
    try {
        let token = req.headers["x-Api-key"]
        if (!token) token = req.headers["x-api-key"]

        if (!token) return res.status(404).send({ status: false, msg: "Token must be present" })

        let decodedToken1 = jwt.verify(token, "Uranium Project-1")

        req.headers["decoded-token"] = decodedToken1.authorId
        
        next()
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.authorization = authorization









