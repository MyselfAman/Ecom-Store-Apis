const BigPromise = require("../middlewares/BigPromise");
const customError = require("../utils/customError");
const User = require("../models/user");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");
const { use } = require("../routes/user");

exports.signup = BigPromise(async (req,res,next)=>{

    let result;
    if(req.files){
        let file = req.files.photo;
        result = await cloudinary.v2.uploader.upload(file.tempFilePath,{
            folder:"users",
            width:150,
            crop:"scale"
        });
    }


    const { name , email , password}  = req.body;

    if(!name || !email || !password) return next(new customError("Name , Email , Password is required", 400));

    const user =  await User.create({
        name,
        email,
        password,
        photo : {
            id: result.public_id,
            secure_url: result.secure_url
        }
    });


    cookieToken(user,res);
})

exports.signin = BigPromise(async (req,res,next) => {
    const {email , password} = req.body;

    if(!email && !password){
        return next(new customError("Please provide email and password",400));
    }

    // to find the email exists or not if exits also select password 
    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new customError("User not found or incorrect email, Please check or create user first.",400))
    }

    // to check password of the user
    const isPasswordCorrect = await user.isValidatedPassword(password);

    if(!isPasswordCorrect){
        return next(new customError("Your password is incorrect",400))
    }

    // if all goods send token
    cookieToken(user,res);
})

exports.logout = BigPromise(async (req,res,next) => {
    res.clearCookie("token");
    res.json({
        status:"sucess",
        message : "Logout Sucessfully"
    })
})

exports.forgotPassword = BigPromise(async (req,res,next) => {
   const {email} = req.body;

   if(!email){
    return next(new customError("Please provide email",400))
   }

   const user = await User.findOne({email});
   if(!user){
    return next(new customError("User not found Please check once",400))
   }

   const forgotToken = await user.getForgotPasswordToken();

    // to save in db only those which are required ignoring rest of the fields
   await user.save({validateBeforeToken:false});
   const url = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`
   const message = `click on the link to reset password \n\n ${url}`
   console.log(user);
   try {

    await sendMail({
        to: user.email,
        subject: "Forgot password",
        message: message
    })

    res.json({
        status:"sucess",
        message:"Token sent sucessfully"
    })
    
    
   } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        // to save in db only those which are required ignoring rest of the fields
        await user.save({validateBeforeToken:false});

        return next(new customError(error.message,400))
   }



})


exports.resetPassword = BigPromise(async (req,res,next) => {
    
    const token = req.params.token;
    console.log(token);
    const encryptedToken = crypto.createHash("sha256")
    .update(token)
    .digest("hex");

    console.dir(encryptedToken);
    // to find user through this encrypt password and also check expiry of the token stored.
    const user = await User.findOne({forgotPasswordToken : encryptedToken , forgotPasswordExpiry:{$gt:Date.now()}});
    console.log(user);

    if(!user){
        return next(new customError("User Not found",400));
    }

    if(!req.body.password){
        return next(new customError("Please provide password",400));
    }

    user.password = req.body.password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    user.save({validateBeforeToken:false});

    res.json({
        status:"sucess",
        message:"Password reset sucessfully."
    })

    
 })


exports.getUserDetails = BigPromise(async (req,res,next) => {

    const id = req.user.id;
    const user = await User.findById({_id:id});


    res.json({
        status:"sucess",
        user
    })
   

    
})


exports.updatePassword = BigPromise(async (req,res,next) => {

    const id = req.user.id;
    const user = await User.findById({_id:id}).select("+password");

    const isPasswordValidated  = await user.isValidatedPassword(req.body.oldPassword);
    console.log(isPasswordValidated);
    if(!isPasswordValidated){
        return next(new customError("Old password is incorrect",400));
    }

    user.password = req.body.newPassword;
    await user.save();

    cookieToken(user,res);

})

exports.updateUserDetails = BigPromise(async (req,res,next) => {

   const newDetails = {
    name: req.body.name,
    email:req.body.email
   }

   if(req.files){
        const user = await User.findById({_id:req.user.id});
        const imageId = user.photo.id;

        // to delete the old photo
        cloudinary.v2.uploader.destroy(imageId)

        // to add new file
        result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath,{
            folder:"users",
            width:150,
            crop:"scale"
        });

        newDetails.photo = {
            id: result.public_id,
            secure_url : result.secure_url
        }

   }


   const user = await User.findByIdAndUpdate(req.user.id , newDetails , {
    new:true,
    runValidators:true,
    useFindAndModify:false
   })
   console.log(user._update);
   console.log(user.name);


   res.json({
    status:"sucess",
    message:"Profile updated sucessfully."
   })

})


exports.admingetAllUser = BigPromise(async (req,res,next) => {
    // to get all the users
    const user = await User.find();

    res.json({
        status: "sucess",
        user
    })
    
        
 
 })

exports.managergetAllUser = BigPromise(async (req,res,next) => {
    // to get all the users
    const user = await User.find({role:"user"});

    res.json({
        status: "sucess",
        user
    })
    
        
 
 })


exports.adminGetUserDetails = BigPromise(async (req,res,next) => {
    const userId = req.params.id;
    console.log(userId);
    const user  = await User.findById({_id:userId});
    // console.log(user);
    if(!user){
        return next(new customError("User details not found, Please check id",400))
    }

    res.json({
        status:"sucess",
        user
    })

    
        
 
 })


exports.adminUpdateAnUser = BigPromise(async(req,res,next) => {
    const newDetails = {
        name: req.body.name,
        email:req.body.email,
        role:req.body.role
    }
    
     
       const user = await User.findByIdAndUpdate(req.params.id , newDetails , {
        new:true,
        runValidators:true,
        useFindAndModify:false
       })
    
       res.json({
        status:"sucess",
        message:"Profile updated sucessfully."
       })
})

exports.adminDeleteAnUser = BigPromise(async(req,res,next) => {


       const user = await User.deleteOne({_id : req.params.id} )

       // remove image from cloudinary
       await cloudinary.v2.uploader.destroy(user.photo.id)

       // to remove user refrence
       user.remove()
    
       res.json({
        status:"sucess",
        message:"User deleted sucessfully."
       })
})