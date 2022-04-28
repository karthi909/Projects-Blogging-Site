const express = require('express');
const router = express.Router();
const controllers = require("../controllers/controllers");
const middleWare=require("../middleware/middleware")

router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

// router.post("/createUser", UserController.createUser  )

// router.get("/getUsersData", UserController.getUsersData)

router.post("/createAuthor", controllers.createAuthor )

router.post("/createBlog", controllers.createBlogs)

router.get("/getAllBlogs",middleWare.middleWare,controllers.getBlogs)

router.put("/blogs/:blogId",middleWare.middleWare,controllers.updateBlogs)

router.delete("/blogs/:blogId", controllers.deleteBlog)

router.delete("/blogs", controllers.deletByQuery)
router.post("/logIn",controllers.login)

module.exports = router;

