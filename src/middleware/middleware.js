const jwt = require('jsonwebtoken');

const authentication = (req, res, next) => {
   try{
    let token = req.headers["x-Api-key"]
    if(!token) {
        token = req.headers["x-api-key"]
    }

    if(!token){
        return res.status(401).send({status: false, msg: "Token must be present"})
    }
    let decodedToken = jwt.verify(token, "Uranium Project-1")

    if(!decodedToken) return res.status(401).send({status: false, msg: "Token is incorrect"})
    let authorId = req.query.authorId;
            console.log(authorId);
            let decodedTokenId = decodedToken.authorId;
            console.log(decodedTokenId);
            if (authorId != decodedTokenId) return res.send({ msg: "Token does not matched" });
    next()
}catch(err){
    res.status(500).send({status: false, Error: err.message})
}
}

const authorization = async (req, res, next) => {
   try{
    let token = req.headers["x-Api-key"]
    if(!token) {
        token = req.headers["x-api-key"]
    }

    if(!token) return res.status(404).send({status: false, msg: "Token must be present"})

    let decodedToken1 = jwt.verify(token, "Uranium Project-1")
    
    if(!decodedToken1) return res.status(401).send({status: false, msg: "Token is incorrect"})

    let logged = decode.authorId

    let authorId = req.headers['authorid']

    if(logged != authorId){
        return res.send({status: false, msg: "Author not allowed"})
    }else{
        next()
    }
}catch (err){
    return res.status(500).send({status: false, msg: err.message})
}
} 

module.exports.authentication = authentication
module.exports.authorization = authorization









