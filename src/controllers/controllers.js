const authorModel = require("../models/authorModel")
const blogsModel = require("../models/blogsModel")
const mongoose = require('mongoose');
const jwt=require('jsonwebtoken')

const validator = require("email-validator")

////////////////////////////////////////////////Create Author////////////////////////////////////////////////////////////////

const createAuthor = async (req, res) => {
    try {
        let data = req.body      //data receiving from the request body
        if(Object.keys(data).length == 0) return res.status(400).send({status : false, Error :"Input Data is Missing"}) //if data is not present
        if(!data.fname) return res.status(400).send({status: false, Error:"First Name is Requried"})   //if firstname  is not present in request body
        if(!data.lname) return res.status(400).send({status: false, Error:"Last Name is Requried"})    //if lastname is not present in request body

        if(!data.title) return res.status(400).send({status: false, Error:"title is Requried"})        //if title is not present in request body
        let validTitle = ['Mr', 'Mrs', 'Miss']
        if(!validTitle.includes(data.title)) return res.status(400).send({status: false, Error: "Title should be one of this (Mr, Mrs, Miss)"})

        if(!data.email) return res.status(400).send({status: false, Error:"email  is Requried"})       //if email id is not present in request body
        let emailData = data.email.toLowerCase()
        if(!validator.validate(emailData)) return res.status(400).send({status: false, Error:"Not a Valid Email address"})  //if email is is not valid
        let findEmail = await authorModel.find({email:emailData})
        if(findEmail.length != 0) return res.status(404).send({status: false, Error: "Email already exist"}) 

        if(!data.password) return res.status(400).send({status: false, Error:"password is Requried"})   //if password is not present in request body
        if(data.password.length > 10) return res.status(400).send({status: false, Error: "Password is too long"})
        

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
        if(Object.keys(blog).length == 0) return res.status(400).send({status : false, Error :"Input Data is Missing"}) //if blogs is not present
        if(!blog.title) return res.status(400).send({status: false, Error:"title is Requried"})  //if title is not present 
        let titleString = /^[A-Za-z\s]+$/
        if(!titleString.test(blog.title)) return res.status(400).send({status: false, Error: "Title must be alphabetic"})

         if(!blog.body) return res.status(400).send({status: false, Error:"body is Requried"})    //if body is not present
         if(!blog.tags) return res.status(400).send({status: false, Error:"tags is Requried"})    //if tags is not present
         if(!blog.category) return res.status(400).send({status: false, Error:"category feild is Requried"})  //if category is not present
         if(!blog.subcategory) return res.status(400).send({status: false, Error:"subCategory is Requried" })  //if subcategory is not present
        
        

        let authorid = req.body.authorId   //authorid receiving from request body
         if (!authorid) return res.send({ status : false,Error: 'Author Id missing' }) //if authorid is not present 

        if(!mongoose.isValidObjectId(authorid)) return res.status(404).send({status : false, Error : "Invalid Mongoose object Id"})  //here we are checking auhtorid is valid are not

        //here we are  autherizing with authorid that the right user or not
        if(req.headers["decoded-token"] != authorid) return res.status(404).send({status : false, Error : "You are not authorised to create a blog"})  

        let author = await authorModel.findOne({ _id: authorid }, { _id: 1 }); //finding the data by authorid 
        if (authorid != author._id) return res.send({ msg: 'invalid AuthorId' }) //checking the author id is valid or not

        let createBlog = await blogsModel.create(blog)  //creating the document using blogModel

        res.status(201).send({ msg: createBlog })    //it will send the data to respond body
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status : false,Error : err.message })
    }
}

/////////////////////////////////////////////////////////get Blogs ////////////////////////////////////////////////////

let getBlogs = async (req, res) => {
    try {
        if(Object.keys(req.query).length == 0) return res.status(400).send({status : false, Error : "Query Data is Missing"})  //if the data is not present in request query

        //insertig the key value pair to the request query
        req.query.isDeleted = false                                        
        req.query.isPublished = true

        let blogs = await blogsModel.find(req.query)  //finding the document


        //Authorization
        if(req.headers["decoded-token"] != blogs[0].authorId) return res.status(404).send({status : false, Error : "You are not authorised to see this blog"}) 

        if (!blogs || blogs.length == 0) return res.status(404).send({ status: false, msg: "Blogs Data not Found" }) //if blogs is not present or blogs is null

        res.status(200).send({ status: true, data: blogs })  //it will send the data to response body
    } catch (err) {
        res.status(500).send({ status: false, Error: err.message });

    }
}

////////////////////////////////////////////////////////update Blogs////////////////////////////////////////////////////

const updateBlogs = async (req, res) => {
    try {
        
        let blogId = req.params.blogId //reciving details in blogId form Params that to be updated 
        
        
        if(!blogId) return res.status(400).send({status : false, Error :"Please Enter a Blog Id"}) //if blogId is missing 
        if(!mongoose.isValidObjectId(blogId)) return res.status(404).send({status : false, Error : "Invalid blogId 1"}) //This wiil validating if the blogId is monggose Id or not 
     
        let check = await blogsModel.findById(blogId) //finding the Blog Id 
        if(!check) return res.status(404).send({status :false,Error : "Invalid BlogId"}) //Validating the blogId

        if(check.isDeleted == true) return res.status(404).send({status :false, Error : "This Data is already deleted from the DataBase"}) // this will check weather the blog is deleted or not if deleted gives error message
        if(req.headers["decoded-token"] != check.authorId) return res.status(404).send({status : false, Error : "You are not authorised to see this blog"}) // check wether the authorId is authorised or not

        //insertig the key value pair to the request body and set the date
       

        let blogAll = req.body  //reciving the data from req(request) body
        console.log(blogAll);
        if(Object.keys(blogAll).length == 0) return res.status(400).send({status: false, msg: "nothing to update"})
        if(!blogAll.title || !blogAll.body || !blogAll.tags || !blogAll.category || !blogAll.subcategory) return res.status(400).send({msg:"data is missing to update"});


        let {title,body,tags,category,subcategory} = blogAll  



        if(!blogAll) return res.status(400).send({status: false, Error: "Input Data is Missing"}) //if data is missing  gives the error 
        //below line will find and update the data given in req body
        req.body.publishedAt = new Date() 
        req.body.isPublished =true; 
       

        let updateBlogs = await blogsModel.findOneAndUpdate({ _id: blogId }, {$addToSet:{tags:tags, subcategory:subcategory},title:title, body:body,category:category},{ new: true })
        if (updateBlogs.length === 0) return res.status(404).send({ status: false, msg: "Failed to Update" }) //if update blog is null gives the error message 

        res.status(200).send({ msg: updateBlogs }) //it wiill send the data to the response body 
    } catch (err) {
        res.status(500).send({ status: false, Error: err.message });

    }
}

/////////////////////////////////////////////////////////delete by path params Blogs////////////////////////////////////////////////

const deleteBlog = async (req, res) => {
    try {
        let blogId = req.params.blogId; //collect the data from params 
        console.log(blogId);        

        if(Object.keys(blogId).length==0) return res.status(404).send({msg:"Invalid Id"});   //if blogId is not present then it gives the error

        if(!mongoose.isValidObjectId(blogId)) return res.status(404).send({status : false, Error : "Invalid Mongoose ObjectId"}) ////This wiil validating if the blogId is monggose Id or not 

        let findBlog = await blogsModel.findById(blogId) //it will find out the blogId 
        if (!findBlog) return res.status(404).send({status: false, Error: "Invalid Blog Id"}) //validate the blogID 

        if(findBlog.isDeleted == true) return res.status(404).send({status: false, Error: "Blog is Already Deleted"}) //it will check wether the blogId is deleted or not if yes gives a message blogId is already deleted

        // check wether the authorId is authorised or not
        if( findBlog.authorId != req.headers["decoded-token"]) return res.status(404).send({status : false, Error : "You are not authorised to see this blog"})

        let updatedblog = await blogsModel.findOneAndUpdate({ _id: findBlog._id }, {isDeleted : true}, { new: true }); //here it will find and update the blogId Deleted to true

        if(!updatedblog) return res.status(404).send({status :  false, Error :"Failed to Delete Data"}) //if authorId is not authorised, gives error

        res.status(200).send({ success:true,data: updatedblog }) //it will send the updated data
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status :false,Error: err.message })
    }

}

//////////////////////////////////////////////////////delete by query params blogs////////////////////////////////////////////////

const deletByQuery = async (req, res) => {
    try {
        let data = req.query //collects the data form query
        console.log(data)
        
        if(!data) return res.status(400).send({status : false, Error :"Input Data is Missing"}) //if data is missing gives an error message 
        let deletData = await blogsModel.find(data,{isPublished :false}) //finding documnet form blogsCollection using blogsModel
        
        if (!deletData) return res.status(404).send({ status: false, msg: "Invalid Input Data"}) //if data is not t
        
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





// const isValidObjectId = function(objectId) {
//     return mongoose.Types.ObjectId.isValid(objectId)
