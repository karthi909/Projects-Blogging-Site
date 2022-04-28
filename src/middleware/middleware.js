const controllers = require('../controllers/controllers')
const jwt = require('jsonwebtoken');
const middleWare = function (req, res, next) {
    let token = req.headers['x-api-key']
    if (!token) return res.status(401).send({ status: false, Error: "Token is Required" })
    let decodedToken = jwt.verify(token, "functionup-Uranium");
    console.log(decodedToken);
    if (!decodedToken)
        return res.send({ status: false, msg: "token is invalid" });
    let authorId = req.params.authorId;
    console.log(authorId);
    let decodedTokeUserId = decodedToken.authorId;
    console.log(decodedTokeUserId);
    if (authorId !== decodedTokeUserId) return res.send({ msg: "Token does not matched" });
    next()
}
module.exports.middleWare = middleWare;








