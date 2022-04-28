const authorModel = require("../models/authorModel")
const blogsModel = require("../models/blogsModel")
const mongoose = require('mongoose');


const createAuthor = async (req, res) => {
    try {
        let data = req.body
        if(!data) return res.status(400).send({status : false, Error :"Input Data is Missing"})
        let savedData = await authorModel.create(data)
        if(!savedData) return res.status(404).send({status :false, Error:"Failed to Create Author Data"})
        res.status(201).send({ Details: savedData })
    } catch (err) {
        res.status(500).send({status : false, Error: err.message })
    }
}


const createBlogs = async (req, res) => {
    try {
        let blog = req.body
        if(!blog) return res.status(400).send({status : false, Error :"Input Data is Missing"})
        let authorid = req.body.authorId
         if (!authorid) return res.send({ status : false,Error: 'Author Id missing' })
        if(!mongoose.isValidObjectId(authorid)) return res.status(404).send({status : false, Error : "Invalid Mongoose object Id"})
        let author = await authorModel.findOne({ _id: authorid }, { _id: 1 });
        if (authorid != author._id) return res.send({ msg: 'invalid AuthorId' })
        let createBlog = await blogsModel.create(blog)
        res.status(201).send({ msg: createBlog })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status : false,Error : err.message })
    }
}


let getBlogs = async (req, res) => {
    try {
        if(!req.query) return res.status(400).send({status : false, Error : "Input Data is Missing"})
        req.query.isDeleted = false
        req.query.isPublished = true
        let blogs = await blogsModel.find(req.query)
        if (!blogs || blogs.length == 0) return res.status(404).send({ status: false, msg: "Blogs Data not Found" })
        res.status(200).send({ status: true, data: blogs })
    } catch (err) {
        res.status(500).send({ status: false, Error: err.message });

    }
}


const updateBlogs = async (req, res) => {
    try {
        let blogId = req.params.blogId
        if(!blogId) return res.status(400).send({status : false, Error :"Input Data is Required"})
        if(!mongoose.isValidObjectId(blogId)) return res.status(404).send({status : false, Error : "Invalid blogId"})
        let check = await blogsModel.findById(blogId)
        if(!check) return res.status(404).send({status :false,Error : "Invalid BlogId"})
        if(check.isDeleted == true) return res.status(404).send({status :false, Error : "This Data is already deleted from the DataBase"})
        req.body.publishedAt = new Date()
        req.body.isPublished =true;
        let blogAll = req.body
        if(!blogAll) return res.status(400).send({status: false, Error: "Input Data is Missing"})
        let updateBlogs = await blogsModel.findOneAndUpdate({ _id: blogId }, blogAll , { new: true })
        if (updateBlogs.length === 0) return res.status(404).send({ status: false, msg: "Failed to Update" })
        res.status(200).send({ msg: updateBlogs })
    } catch (err) {
        res.status(500).send({ status: false, Error: err.message });

    }
}


const deleteBlog = async (req, res) => {
    try {
        let blogId = req.params.blogId;
        if(!blogId) return res.status(400).send({status :false,Error:"BlogId is Required"})
        if(!mongoose.isValidObjectId(blogId)) return res.status(404).send({status : false, Error : "Invalid blogId"})
        let updatedblog = await blogsModel.findOneAndUpdate({ _id: blogId }, {isDeleted : true}, { new: true });
        if(!updatedblog) return res.status(404).send({status :  false, Error :"Failed to Delete Data"})
        res.status(200).send({ status: true, data: updatedblog })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status :false,Error: err.message })
    }

}


const deletByQuery = async (req, res) => {
    try {
        let data = req.query
        if(!data) return res.status(400).send({status : false, Error :"Input Data is Missing"})
        let deletData = await blogsModel.find(data,{isPublished :false})
        if (!deletData) return res.status(404).send({ status: false, msg: "Invalid Input Data"})
        let delete1 = await blogsModel.findByIdAndUpdate(deletData[0]._id,{isDeleted:true},{new : true})
        if(!delete1) return res.status(404).send({status :false, Error :"Failed to Delete Data"})
        res.status(200).send({ status: true, msg: delete1 })
    } catch (err) {
        res.status(500).send({ status: false, Error: err.message })
    }
}



module.exports.createAuthor = createAuthor

module.exports.createBlogs = createBlogs

module.exports.getBlogs = getBlogs

module.exports.updateBlogs = updateBlogs

module.exports.deleteBlog = deleteBlog

module.exports.deletByQuery = deletByQuery


