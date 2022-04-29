const authorModel = require("../models/authorModel")

const loginAuthor = async (req, res) => {
    try{
    let data = req.body
    if(Object.keys(data).length == 0) return res.status(400).send({status: false, msg: "Email and password is required to login"})
    
    let getAuthorData = await authorModel.findOne({email: data.email, password: data.password})
    if(!getAuthorData) return res.status(401).send({ status: false, msg: "Email or password is incorrect"})

    let token = jwt.sign({authorId: getAuthorData._id}, "Uranium Project-1")

    res.setHeader("x-api-key", token)
    res.status(200).send({status: true, msg: token})
    }catch(err){
        res.status(200).send({status: true, Error: err.message})
    }
}

module.exports.loginAuthor = loginAuthor