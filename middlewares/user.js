const BigPromise = require("../middlewares/BigPromise");
const customError = require("../utils/customError");
const jwt = require("jsonwebtoken")
const User = require("../models/user")

exports.isLoggedIn = BigPromise(async (req,res,next) => {
    const token = req.cookies.token || req.header("Authorization").replace("Bearer ","");

    if(!token){
        return next(new customError("Please provide token",400))
    }

    // verifiying jwt token sent by user then giving me userdetails access
    const decoded = jwt.verify(token , process.env.JWT_SECRET_KEY)


    // storing user inside custom req.user 
    req.user = await User.findById(decoded.id);
    next();

})


exports.isAdmin = function(...roles){
   return(req,res,next) => {
    // if loged in user role is not same as we have passed in middleware
    if(!roles.includes(req.user.role)){
        return next(new customError("You are not allowed for this resource",400))

    }
    // if loged in user is same as what we have passes in middleware then in user rotes 
    next()
   }



}