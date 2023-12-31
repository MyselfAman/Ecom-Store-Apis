const express = require("express");
require("dotenv").config();
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");




// for swagger documentation
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')
const file  = fs.readFileSync('./swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



// regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended:true}));

// cookie and file middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

// morgan middleware
app.use(morgan("tiny"));


//import all routes here
const home  = require("./routes/home");
const user = require("./routes/user");
const product = require("./routes/product");

// router middleware
app.use("/api/v1",home) // as soon as someone visit /api/v1 visit home route
app.use("/api/v1",user) 
app.use("/api/v1",product) 

// export app 
module.exports = app 