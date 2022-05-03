const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://KA909_1:karthi123@cluster0.qpomb.mongodb.net/project-Blogs", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


app.use('/', route)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});

//hhhhhhhhhhhhhhh
//mongodb+srv://project-1_G10:OCBfkRxYDJRMsStJ@cluster0.evjpk.mongodb.net/project-blogs