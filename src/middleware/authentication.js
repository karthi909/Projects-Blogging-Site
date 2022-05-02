const authorModel = require('../models/authorModel')
const jwt = require('jsonwebtoken')
const validator = require("email-validator")

//authentication
const loginAuthor = async (req, res) => {
    try{
    let data = req.body
    if(Object.keys(data).length == 0) return res.status(400).send({status: false, msg: "Email and password is required to login"})
    
    let getAuthorData = await authorModel.findOne({email: data.email, password: data.password})
    if(!data.email ) return res.status(400).send({status: false, Error:"email Feild is  Empty"})
    if(!data.password) return res.status(400).send({status: false, Error:"Password Feild is Empty"})
    if(!validator.validate(data.email)) return res.status(400).send({status: false, Error:"Not a Valid Email address"})
    if(!getAuthorData) return res.status(401).send({ status: false, msg: "Email or password is incorrect"})

    let token = jwt.sign({authorId: getAuthorData._id}, "Uranium Project-1",{ expiresIn: '2h'})

    // res.setHeader("x-api-key", token)
    res.status(200).send({status: true, message: "Author Login succesfully", data: {token: token}}, )
    }catch(err){
        res.status(200).send({status: true, Error: err.message})
    }
}

module.exports.loginAuthor = loginAuthor


