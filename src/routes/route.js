const express = require('express');
const router = express.Router();

const controllers = require("../controllers/controllers");
const blogsModel = require('../models/blogsModel');

router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

// router.post("/createUser", UserController.createUser  )

// router.get("/getUsersData", UserController.getUsersData)

router.post("/createAuthor", controllers.createAuthor )

router.post("/createBlog", controllers.createBlogs)

router.get("/getAllBlogs", controllers.geAllBlogs)


router.get("/getfilterBlogs", controllers.filterBlogs)




module.exports = router;

