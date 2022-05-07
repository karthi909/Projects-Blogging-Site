const authorModel = require("../models/authorModel")
const blogsModel = require("../models/blogsModel")
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')

const validator = require("email-validator")

////////////////////////////////////////////////Create Author////////////////////////////////////////////////////////////////

const createAuthor = async (req, res) => {
    try {
        let data = req.body      //data receiving from the request body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, Error: "Input Data is Missing" }) //if data is not present

        //here we can check that if firstname and lastname is not present in request body
        if(!data.fname) return res.status(400).send({ status: false, Error: "First Name is Feild is Missing" })
        if (data.fname.trim().length == 0) return res.status(400).send({ status: false, Error: "First Name is Requried" })

        if (!data.lname) return res.status(400).send({ status: false, Error: "Last Name feild is Missing" }) 
        if (data.lname.trim().length == 0) return res.status(400).send({ status: false, Error: "Last Name is Requried" })   

        if (!data.title) return res.status(400).send({ status: false, Error: "title feild is Missing" })
        if (data.title.trim().length == 0) return res.status(400).send({ status: false, Error: "title is Requried" })        //if title is not present in request body

        //validate the title
        let validTitle = ['Mr', 'Mrs', 'Miss']
        if (!validTitle.includes(data.title)) return res.status(400).send({ status: false, Error: "Title should be one of this (Mr, Mrs, Miss)" })

        if(!data.email) return res.status(400).send({ status: false, Error: "email  is Feild Missing" }) 
        if (data.email.trim().length == 0) return res.status(400).send({ status: false, Error: "email  is Requried" }) //if email id is not present in request body

        let emailData = data.email.toLowerCase()
        if (!validator.validate(emailData)) return res.status(400).send({ status: false, Error: "Not a Valid Email address" })  //if emailid is is not valid
        let findEmail = await authorModel.find({ email: emailData })
        if (findEmail.length != 0) return res.status(404).send({ status: false, Error: "Email already exist" })

        if (!data.password) return res.status(400).send({ status: false, Error: "password is Requried" })   //if password is not present in request body
        if (data.password.length > 10) return res.status(400).send({ status: false, Error: "Password is too long" })


        //we are creating the document using authorModel
        let savedData = await authorModel.create(data) //we are creating the document using authorModel
        if (!savedData) return res.status(404).send({ status: false, Error: "Failed to Create Author Data" }) 

        res.status(201).send({status: true,msg: "Author created successfully", data: savedData })   //sending the data in the respond body
    } catch (err) {
        res.status(500).send({ status: false, Error: err.message })
    }
}


///////////////////////////////////////////////////Create Blogs/////////////////////////////////////////////////////////////

const createBlogs = async (req, res) => {
    try {
        let blog = req.body     // blogs data receiving from request body

        if (Object.keys(blog).length == 0) return res.status(400).send({ status: false, Error: "Input Data is Missing" }) //if blogs is not present


        if(!blog.title) return res.status(400).send({ status: false, Error: "title Feild is Missing " })
        if (blog.title.trim().length == 0) return res.status(400).send({ status: false, Error: "title is Requried" })  //if title is not present 
        let titleString = /^[ A-Za-z0-9_@./#&+-]*$/
        if (!titleString.test(blog.title)) return res.status(400).send({ status: false, Error: "Title must be alphabetic" })

        //if body,tags,category and subcategory is not present then show error
        if (!blog.body) return res.status(400).send({ status: false, Error: "body Feild is Missing " })
        
        if (!blog.tags) return res.status(400).send({ status: false, Error: "tags Feild is Missing" })
        if (blog.tags.trim().length == 0) return res.status(400).send({ status: false, Error: "tags is Requried" })
        
        if (!blog.category) return res.status(400).send({ status: false, Error: "category feild is Missing" })
        if (blog.category.trim().length == 0) return res.status(400).send({ status: false, Error: "category feild is Requried" })
        
        if (!blog.subcategory) return res.status(400).send({ status: false, Error: "subCategoryFeild is Missing " }) 
        if (blog.subcategory.trim().length == 0) return res.status(400).send({ status: false, Error: "subCategory is Requried" }) 



        blog.publishedAt = new Date()

        let authorid = req.body.authorId   //authorid receiving from request body
        if (!authorid) return res.send({ status: false, Error: 'Author Id missing' }) //if authorid is not present 
        if (!mongoose.isValidObjectId(authorid)) return res.status(404).send({ status: false, Error: "Invalid Mongoose object Id" })  //here we are checking auhtorid is valid are not

        //here we are  autherizing with authorid that the right user or not
        if (req.headers["decoded-token"] != authorid) return res.status(404).send({ status: false, Error: "You are not authorised to create a blog" })
        let author = await authorModel.findOne({ _id: authorid }, { _id: 1 }); //finding the data by authorid 
        if (authorid != author._id) return res.send({ msg: 'invalid AuthorId' }) //checking the author id is valid or not

        //creating the document using blogModel
        let createBlog = await blogsModel.create(blog)  
        res.status(201).send({ status: true, message: "Blogs Created successfully",data: createBlog })    //it will send the data to respond body
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, Error: err.message })
    }
}

/////////////////////////////////////////////////////////get Blogs ////////////////////////////////////////////////////

let getBlogs = async (req, res) => {
    try {
        if (Object.keys(req.query).length == 0) return res.status(400).send({ status: false, Error: "Query Data is Missing" })  //if the data is not present in request query

        //insertig the key value pair to the request query
        req.query.isDeleted = false
        req.query.isPublished = true

        //finding the document in collection
        let blogs = await blogsModel.find(req.query)  

        //Authorization
        if (req.headers["decoded-token"] != blogs[0].authorId) return res.status(404).send({ status: false, Error: "You are not authorised to see this blog" })

        if (!blogs || blogs.length == 0) return res.status(404).send({ status: false, msg: "Blogs Data not Found" }) //if blogs is not present or blogs is null

        res.status(200).send({ status: true, message: "Blog Lists", data: blogs })  //it will send the data to response body
    } catch (err) {
        res.status(500).send({ status: false, Error: err.message });

    }
}

////////////////////////////////////////////////////////update Blogs////////////////////////////////////////////////////

const updateBlogs = async (req, res) => {
    try {

        let blogId = req.params.blogId //reciving details in blogId form Params that to be updated 
        if (!blogId) return res.status(400).send({ status: false, Error: "Please Enter a Blog Id" }) //if blogId is missing 
        if (!mongoose.isValidObjectId(blogId)) return res.status(404).send({ status: false, Error: "Invalid Mongoose ObjectId" }) //This wiil validating if the blogId is monggose Id or not 

        //finding the Blog Id and after we are Validating the blogId
        let check = await blogsModel.findById(blogId)  
        if (!check) return res.status(404).send({ status: false, Error: "Invalid BlogId" }) 

        if (check.isDeleted == true) return res.status(404).send({ status: false, Error: "This Data is already deleted from the DataBase" }) // this will check weather the blog is deleted or not if deleted gives error message
        if (req.headers["decoded-token"] != check.authorId) return res.status(404).send({ status: false, Error: "You are not authorised to see this blog" }) // check wether the authorId is authorised or not

        
        let blogAll = req.body  //reciving the data from req(request) body
        if (Object.keys(blogAll).length == 0) return res.status(400).send({ status: false, msg: "nothing to update" })
        
        let { title, body, tags, category, subcategory, isPublished } = blogAll
        //insertig the key value pair to the request body and set the date
        req.body.publishedAt = new Date()
        req.body.isPublished = true;

        //below line will find and update the data given in req body
        let updateBlogs = await blogsModel.findOneAndUpdate({ _id: blogId }, { $addToSet: { tags: tags, subcategory: subcategory }, title: title, body: body, category: category, isPublished: isPublished }, { new: true })
        if (updateBlogs.length === 0) return res.status(404).send({ status: false, msg: "Failed to Update" }) //if update blog is null gives the error message 

        res.status(200).send({status: true, message: "Updated Successfully", data: updateBlogs }) //it wiill send the data to the response body 
    } catch (err) {
        res.status(500).send({ status: false, Error: err.message });

    }
}

/////////////////////////////////////////////////////////delete by path params Blogs////////////////////////////////////////////////



const deleteBlog = async (req, res) => {
try {
        let blogId = req.params.blogId; //collect the data from params 

        if (Object.keys(blogId).length == 0) return res.status(404).send({ msg: "Invalid Id" });   //if blogId is not present then it gives the error

        if (!mongoose.isValidObjectId(blogId)) return res.status(404).send({ status: false, Error: "Invalid Mongoose ObjectId" }) ////This wiil validating if the blogId is monggose Id or not 

        let findBlog = await blogsModel.findById(blogId) //it will find out the blogId 
        if (!findBlog) return res.status(404).send({ status: false, Error: "Invalid Blog Id" }) //validate the blogID 

        if (findBlog.isDeleted == true) return res.status(404).send({ status: false, Error: "Blog is Already Deleted" }) //it will check wether the blogId is deleted or not if yes gives a message blogId is already deleted

        // check wether the authorId is authorised or not
        if (findBlog.authorId != req.headers["decoded-token"]) return res.status(404).send({ status: false, Error: "You are not authorised to see this blog" })

         //here it will find and update the blogId Deleted to true
        let updatedblog = await blogsModel.findOneAndUpdate({ _id: findBlog._id }, { isDeleted: true, deletedAt: new Date()}, { new: true });

        if (!updatedblog) return res.status(404).send({ status: false, Error: "Failed to Delete Data" }) //if authorId is not authorised, gives error

        res.status(200).send({ status: true,message: "Blog deletion is successful", data: updatedblog }) //it will send the updated data
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, Error: err.message })
    }

}

//////////////////////////////////////////////////////delete by query params blogs////////////////////////////////////////////////

const deletByQuery = async (req, res) => {
    try {
        let data1 = req.query //collects the data form query
        
        if (!data1) return res.status(401).send({ status: false, Error: "Input Data is Missing" }) //if data is missing gives an error message 
        if (!data1.authorId && !data1.category && !data1.subcategory && !data1.tags && !data1.isPublished) return res.status(400).send({ Error: "data is missing to update" });
        if (data1.isPublished == true) return res.status(400).send({ status: false, Error: "data must be unpublished" })
        let deletData = await blogsModel.find(data1) //finding documnet form blogsCollection using blogsModel
        //console.log(deletData)

       if(deletData[0].isDeleted == true) return res.status(404).send({msg:"The data is already deleted"});

        if (!deletData) return res.status(404).send({ status: false, msg: "Invalid Input Data" }) //if data is not t
       
        if (req.headers["decoded-token"] != deletData[0].authorId) return res.status(404).send({ status: false, Error: "You are not authorised to see this blog" })

       // here it will find and update the document Deleted to true
        let delete1 = await blogsModel.findByIdAndUpdate(deletData[0]._id, { isDeleted: true, deletedAt: new Date() }, { new: true })
        if (!delete1) return res.status(404).send({ status: false, Error: "Failed to Delete Data" })

        res.status(200).send({ status: true,message: "Deleted Successfully", data: delete1 })
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