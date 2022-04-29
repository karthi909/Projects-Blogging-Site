const authorModel = require("../models/authorModel")
const blogsModel = require("../models/blogsModel")
const mongoose = require('mongoose');
const jwt=require('jsonwebtoken')

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

////////////////////////////////////////////////Create Author////////////////////////////////////////////////////////////////

const createAuthor = async (req, res) => {
    try {
        let data = req.body      //data receiving from the request body
        if(!data) return res.status(400).send({status : false, Error :"Input Data is Missing"}) //if data is not present
        if(!data.fname) return res.status(400).send({status: false, Error:"First Name is Requried"})   //if firstname  is not present in request body
        if(!data.lname) return res.status(400).send({status: false, Error:"Last Name is Requried"})    //if lastname is not present in request body
        if(!data.title) return res.status(400).send({status: false, Error:"title is Requried"})        //if title is not present in request body
        if(!data.email) return res.status(400).send({status: false, Error:"email  is Requried"})       //if email id is not present in request body
        if(data.email != validateEmail) return res.status(400).send({status: false, Error:"Not a Valid Email Address"}) //if email is is not valid
        if(!data.password) return res.status(400).send({status: false, Error:"password is Requried"})   //if password is not present in request body
        

        let savedData = await authorModel.create(data) //we are creating the document using authorModel

        if(!savedData) return res.status(404).send({status :false, Error:"Failed to Create Author Data"})  //if savedData is not present
        
        res.status(201).send({ Details: savedData })   //sending the data in the respond body
    } catch (err) {
        res.status(500).send({status : false, Error: err.message })
    }
}


///////////////////////////////////////////////////Create Blogs/////////////////////////////////////////////////////////////

const createBlogs = async (req, res) => {
    try {
        let blog = req.body     // blogs data receiving from request body
        if(!blog) return res.status(400).send({status : false, Error :"Input Data is Missing"}) //if blogs is not present
        if(!title) return res.status(400).send({status: false, Error:"title is Requried"})  //if title is not present 
        if(!body) return res.status(400).send({status: false, Error:"body is Requried"})    //if body is not present
        if(!tags) return res.status(400).send({status: false, Error:"tags is Requried"})    //if tags is not present
        if(!category) return res.status(400).send({status: false, Error:"category feild is Requried"})  //if category is not present
        if(!subcategory) return res.status(400).send({status: false, Error:"subCategory is Requried" })  //if subcategory is not present
        if(!title) return res.status(400).send({status: false, Error:"title is Requried"})      //if title is not present
        

        let authorid = req.body.authorId   //authorid receiving from request body
         if (!authorid) return res.send({ status : false,Error: 'Author Id missing' }) //if authorid is not present 

        if(!mongoose.isValidObjectId(authorid)) return res.status(404).send({status : false, Error : "Invalid Mongoose object Id"})  //here we are checking auhtorid is valid are not

        //here we are  autherizing with authorid that the right user or not
        if(req.headers["decoded-token"] != authorid) return res.status(404).send({status : false, Error : "You are not authorised to create a blog"})  

        let author = await authorModel.findOne({ _id: authorid }, { _id: 1 }); //finding the data by authorid 
        if (authorid != author._id) return res.send({ msg: 'invalid AuthorId' }) //checking the author id is valid or not

        let createBlog = await blogsModel.create(blog)  //creating the document using blogModel

        res.status(201).send({ msg: createBlog })    //sending data from respond body
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status : false,Error : err.message })
    }
}

/////////////////////////////////////////////////////////get Blogs ////////////////////////////////////////////////////

let getBlogs = async (req, res) => {
    try {
        if(!req.query) return res.status(400).send({status : false, Error : "Input Data is Missing"})  //if the data is not present in request query

        //insertig the key value pair to the request query
        req.query.isDeleted = false                                        
        req.query.isPublished = true

        let blogs = await blogsModel.find(req.query)  //finding the document

        //Authorization
        if(req.headers["decoded-token"] != blogs[0].authorId) return res.status(404).send({status : false, Error : "You are not authorised to see this blog"}) 

        if (!blogs || blogs.length == 0) return res.status(404).send({ status: false, msg: "Blogs Data not Found" }) //if blogs is not present or blogs is null

        res.status(200).send({ status: true, data: blogs })  //sending the data to response body
    } catch (err) {
        res.status(500).send({ status: false, Error: err.message });

    }
}

////////////////////////////////////////////////////////update Blogs////////////////////////////////////////////////////

const updateBlogs = async (req, res) => {
    try {
        let blogId = req.params.blogId
        if(!blogId) return res.status(400).send({status : false, Error :"Input Data is Required"})
        if(!mongoose.isValidObjectId(blogId)) return res.status(404).send({status : false, Error : "Invalid blogId"})

        let check = await blogsModel.findById(blogId)
        if(!check) return res.status(404).send({status :false,Error : "Invalid BlogId"})

        if(check.isDeleted == true) return res.status(404).send({status :false, Error : "This Data is already deleted from the DataBase"})
        if(req.headers["decoded-token"] != check.authorId) return res.status(404).send({status : false, Error : "You are not authorised to see this blog"})

        req.body.publishedAt = new Date()
        req.body.isPublished =true;

        let blogAll = req.body
        let {title,body,tags,category,subcategory} = blogAll
        if(!blogAll) return res.status(400).send({status: false, Error: "Input Data is Missing"})

        let updateBlogs = await blogsModel.findOneAndUpdate({ _id: blogId }, {$addToSet:{tags:tags, subcategory:subcategory},title:title, body:body,category:category},{ new: true })
        if (updateBlogs.length === 0) return res.status(404).send({ status: false, msg: "Failed to Update" })

        res.status(200).send({ msg: updateBlogs })
    } catch (err) {
        res.status(500).send({ status: false, Error: err.message });

    }
}

/////////////////////////////////////////////////////////delete by path params Blogs////////////////////////////////////////////////

const deleteBlog = async (req, res) => {
    try {
        let blogId = req.params.blogId;

        if(!blogId) return res.status(400).send({status :false,Error:"BlogId is Required"})

        if(!mongoose.isValidObjectId(blogId)) return res.status(404).send({status : false, Error : "Invalid blogId"})

        let findBlog = await blogsModel.findById(blogId)
        if (!findBlog) return res.status(404).send({status: false, Error: "Invalid Blog Id"})

        if(findBlog.isDeleted == true) return res.status(404).send({status: false, Error: "Blog is Already Deleted"})

        if( findBlog.authorId != req.headers["decoded-token"]) return res.status(404).send({status : false, Error : "You are not authorised to see this blog"})
        let updatedblog = await blogsModel.findOneAndUpdate({ _id: findBlog._id }, {isDeleted : true}, { new: true });

        if(!updatedblog) return res.status(404).send({status :  false, Error :"Failed to Delete Data"})
        res.status(200).send({ status: true, data: updatedblog })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status :false,Error: err.message })
    }

}

//////////////////////////////////////////////////////delete by query params blogs////////////////////////////////////////////////

const deletByQuery = async (req, res) => {
    try {
        let data = req.query

        if(!data) return res.status(400).send({status : false, Error :"Input Data is Missing"})
        let deletData = await blogsModel.find(data,{isPublished :false})
        
        if (!deletData) return res.status(404).send({ status: false, msg: "Invalid Input Data"})
        
        if(req.headers["decoded-token"] != deletData[0].authorId) return res.status(404).send({status : false, Error : "You are not authorised to see this blog"})

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



