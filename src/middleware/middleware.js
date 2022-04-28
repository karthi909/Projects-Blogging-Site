


const jwt = require('jsonwebtoken');


const middleWare = function (req, res, next) {
    try{
        let token = req.headers['x-api-key']
        if (!token) return res.status(401).send({ status: false, Error: "Token is Required" })
        let decodedToken = jwt.verify(token, "functionup-Uranium");
        console.log(decodedToken);
        // if (!decodedToken)
        //     return res.send({ status: false, msg: "token is invalid" });
        let authorId = req.params.authorId;
        console.log(authorId);
        let decodedTokeUserId = decodedToken.authorId;
        console.log(decodedTokeUserId);
        if (authorId !== decodedTokeUserId) return res.send({ msg: "Token does not matched" });
        next()
    }
    catch(err){
        res.status(500).send({status: false, Error: err.message})
    }


    }
module.exports.middleWare = middleWare;








