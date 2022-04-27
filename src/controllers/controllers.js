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
// Filter blogs list by applying filters. Query param can have any combination of below filters.
// - By author Id
// - By category
// - List of blogs that have a specific tag
// - List of blogs that have a specific subcategory
// example of a query url: blogs?filtername=filtervalue&f2=fv2


const geAllBlogs = async function (req, res) {
    try{
    //   let headers = req.query.authorId || req.query.category || req.query.tags || req.query.subcategory
    // let headers = req.query.authorId && req.query.category && req.query.tags || req.query.subcategory
    //   console.log( ...headers)
     
      let blogsData = await blogsModel.find({$and: [{isPublished: true},{isDeleted: false}]})

      if(blogsData.length === 0){
          return res.status(404).send({msg: "Not Found"})
      }
      res.status(200).send({status: true, data: blogsData});
    }catch(err){
      res.status(500).send({status: false, msg: err.message});

}
  };
  let filterBlogs = async function (req, res){
      let author = req.query.authorId
      let category = req.query.category
      let tag = req.query.tags
      let subcategory = req.query.subcategory
      let blogs = await blogsModel.find({$or: [{authorId: author},{category: category},{tags: tag}, {subcategory: subcategory}]},{isPublished: true},{isDeleted: false})
      console.log(blogs)
  }
  

module.exports.createAuthor= createAuthor

module.exports.createBlogs = createBlogs

module.exports.geAllBlogs = geAllBlogs

module.exports.filterBlogs = filterBlogs

