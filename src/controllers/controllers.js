const authorModel = require("../models/authorModel")
const blogsModel = require("../models/blogsModel")


const createAuthor= async function (req, res) {
    let data= req.body
    let savedData= await authorModel.create(data)
    res.send({msg: savedData})
}


const createBlogs = async function (req, res) {
    try{
        let blog = req.body
        let authorid = req.body.authorId
        console.log(authorid)

        let author = await authorModel.findOne({_id: authorid}, {_id:1});

        console.log(author)
        if (!authorid) {
            res.send({msg:' author Id missing'})
        } 
        
         if( authorid != author._id){
            res.send({msg: 'invalid authorId'})
        }

        let createBlog = await blogsModel.create(blog)

        res.status(201).send({msg: createBlog})
    } 
    catch (err) {
        console.log(err)
        res.status(500).send({msg: err.message})
    }
}

module.exports.createBlogs = createBlogs

module.exports.createAuthor= createAuthor

