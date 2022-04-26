const express = require('express');
const router = express.Router();

const controllers = require("../controllers/controllers")

router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

// router.post("/createUser", UserController.createUser  )

// router.get("/getUsersData", UserController.getUsersData)

router.post("/createAuthor", controllers.createAuthor )


module.exports = router;

