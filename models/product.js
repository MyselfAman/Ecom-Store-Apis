const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true,"Please provide product name"],
        trim:true, // to remove space from the end
        maxLength: [120,"Product name shouldn't be more then 120 characters"]
    },
    price: {
        type:Number,
        required:[true,"Please provide product price"],
        maxLength: [6,"Product price shouldn't be more then 6 digits"]
    },
    description: {
        type:String,
        required:[true,"Please provide product description"],
    },
    photos:[
        {
            id:{
                type:String,
                required:true
            },
            secure_url:{
                type:String,
                required:true
            }
        }
    ],
    category: {
        type:String,
        required:[true,"Please select category from shortsleeves , longsleeves, sweatshirts , hoodies"],
        enum:{ // to only allow these values we use enums
            values:[
                'shortsleeves',
                'longsleeves',
                'sweatshirts',
                'hoodies'
            ],
            message:"Please select category from shortsleeves , longsleeves, sweatshirts , hoodies "
        }
    },
    brand: {
        type:String,
        required:[true,"Please provide product brand"],
    },
    ratings: {
        type:Number,
        default:0
    },
    numberOfReviews: {
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required:true
            },
            name:{
                type: String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    createdAt:{
        type:Date,
        default: Date.now
    }
})

// create model of the schema and export it
module.exports = mongoose.model("Product",productSchema);