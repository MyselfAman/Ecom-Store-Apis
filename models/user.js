const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto")
// user Schema
const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, "Plese provide a name"],
        maxLength: [40,"Name should be under 40 characters"]
    } ,
    email:{
        type: String,
        required: [true, "Plese provide a email"],
        validate: [validator.isEmail, "Please entera valid email"],
        unique:true // moongose will check in db if same email is present or not
    },
    password:{
        type: String,
        required: [true, "Plese provide a password"],
        minLength:[6, "Password should be atleast 6 character"],
        select : false // password will not come when i use this model
    },
    role:{
        type:String,
        default : "user"
    },
    photo:{
        id:{
            type : String,
            required:true
        },
        secure_url:{
            type:String,
            required:true
        }
    },
    forgotPasswordToken:String,
    forgotPasswordExpiry:Date,
    createdAt:{
        type: Date,
        default: Date.now
    }
 
});



// Hook encrypt password before save event only when password has been touched
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10); 

})

// to validate the password user sent with the stored password
userSchema.methods.isValidatedPassword = async function(recivedPassword){
    return await bcrypt.compare(recivedPassword , this.password)
}

userSchema.methods.getJwtToken = function(){
    return jwt.sign(
        {id:this._id , name: this.name},
        process.env.JWT_SECRET_KEY,
        {expiresIn : process.env.JWT_EXPIRY_DATE}
    )
}

// to genrate forgot password token
userSchema.methods.getForgotPasswordToken = function(){
    // to generate long random string & send it to user 
    const forgotToken = crypto.randomBytes(20).toString('hex');

    // getting hash and storing it in databse and when get
    //the randomString sent to user back again hash and compare 

    this.forgotPasswordToken = crypto.createHash("sha256")
        .update(forgotToken)
        .digest("hex");
    
    this.forgotPasswordExpiry = Date.now() + 20 * 60 *1000

    return forgotToken;
}

// create model of the schema and export it
module.exports = mongoose.model("User",userSchema);