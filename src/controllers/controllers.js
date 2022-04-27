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

let getBlogs = async function (req, res){
    try{
      req.query.isDeleted = false
      req.res.isPublished = true
      let blogs = await blogsModel.find(req.query)
      console.log(blogs)
      if(blogs.length === 0){
          return res.status(404).send({status: false, msg: "Not Found"})
      }
      res.status(200).send({status: true, data: blogs})
    }catch(err){
              res.status(500).send({status: false, msg: err.message});
        
        }
  }

  const updateBlogs = async function(req, res){
      try{
      let blogId = req.params.blogId
      let blogAll = req.body
      const updateBlogs = await blogsModel.findOneAndUpdate(
          {_id: blogId},
           blogAll,
          {new: true}
      )
      if(updateBlogs.length === 0){
        return res.status(404).send({status: false, msg: "Not Updated"})
      }
      res.status(200).send({msg: updateBlogs})
      }catch(err){
        res.status(500).send({status: false, msg: err.message});
  
  }
  }
  

module.exports.createAuthor= createAuthor

module.exports.createBlogs = createBlogs

module.exports.getBlogs = getBlogs

module.exports.updateBlogs = updateBlogs



