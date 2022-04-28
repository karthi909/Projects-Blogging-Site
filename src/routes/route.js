const express = require('express');
const router = express.Router();
const controllers = require("../controllers/controllers");
const commonMW = require("../middleware/middleware")

router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})


router.post("/createAuthor", controllers.createAuthor )

router.post("/createBlog",commonMW.authorization, controllers.createBlogs)

router.get("/getAllBlogs",commonMW.authorization,controllers.getBlogs)

router.put("/blogs/:blogId",commonMW.authorization,controllers.updateBlogs)

router.delete("/blogs/:blogId", controllers.deleteBlog)

router.delete("/blogs", controllers.deletByQuery)

router.post("/login",controllers.loginAuthor)

module.exports = router;

