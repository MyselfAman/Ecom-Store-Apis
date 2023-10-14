const BigPromise = require("../middlewares/BigPromise");
const product = require("../models/product");
const CustomError = require("../utils/customError");
const cloudinary = require("cloudinary")
const filterProduct = require("../utils/filterProduct")



exports.addProduct = BigPromise(async (req,res,next) =>{

    const photoArray = [];

    if(!req.files){
        return next(new CustomError("Please provide photo of the product",400))
    }

    if(req.files){
        let result;
        for(let index = 0; index < req.files.photos.length; index++) {
            console.log("hi=====>",req.files.photos[index]);
            result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
                folder : "products"
            })

            photoArray.push({
                id:result.public_id,
                secure_url: result.secure_url
            })
        }
    }

    console.log(photoArray)

    req.body.photos = photoArray;
    req.body.user = req.user.id

    const myproduct = await product.create(req.body)

    res.status(200).json({
        sucess:true,
        myproduct
    })
})


exports.getAllProduct = BigPromise(async (req,res,next) =>{
    // to fix no of product per page
    const resultPerPage = 6;
    // to count all the products availabe in db
    const totalcountProduct = await product.countDocuments();
    // return objects which contains all the methods of calss filterProduct
    // & used to filter the product based on search & filter
    const productsObj = new filterProduct(product.find(),req.query).search().filter();

    let products = await productsObj.base;

    // to find length of filtered product
    const filteredProductNumber = products.length;

    // products.limit().skip()
    // console.log(productsObj.pager)
    
    productsObj.pager(resultPerPage);
    products = await productsObj.base.clone();

    res.status(200).json({
        sucess:true,
        products,
        filteredProductNumber,
        totalcountProduct
    })
})

exports.admingetAllProduct = BigPromise(async (req,res,next) =>{
   
    const products = await product.find();

    res.status(200).json({
        sucess:true,
        products,
    })
})


exports.getProductDetails = BigPromise(async (req,res,next) =>{
   
    // console.log(req.params.id)
    const productDetails = await product.findById(req.params.id);

    if(!productDetails){
        return next(new CustomError("Product details not found",400))
    }
    res.status(200).json({
        sucess:true,
        productDetails,
    })
})


exports.updateProduct = BigPromise(async (req,res,next) =>{
    
    const productDetails = await product.findById(req.params.id);
    if(!productDetails){
        return next(new CustomError("Product details not found",400))
    }

    let imagesArray =[];
    if(req.files){
        // to delete the old photo
        for (let index = 0; index < productDetails.photos.length; index++) {
            await cloudinary.v2.uploader.destroy(productDetails.photos[index].id)
        }
        //to add the new photo
        for (let index = 0; index < req.files.photos.length; index++) {
            const result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
                folder: "products"
                
            })

            imagesArray.push({
                id: result.public_id,
                secure_url : result.secure_url
            })
            
        }
        req.body.photos = imagesArray;
    }
    
    const updatedProduct = await product.findByIdAndUpdate(req.params.id , req.body,{
        new :true,
        runValidators:true
    })



    res.status(200).json({
        sucess:true,
        updatedProduct,
    })
})


exports.deleteProduct = BigPromise(async (req,res,next) =>{
    
    const productDetails = await product.findById(req.params.id);
    if(!productDetails){
        return next(new CustomError("Product details not found",400))
    }

    if(productDetails.photos.length!==0)
      // to delete the old photo
      for (let index = 0; index < productDetails.photos.length; index++) {


        await cloudinary.v2.uploader.destroy(productDetails.photos[index].id)
        
    }

    await product.deleteOne({_id : req.params.id} )





    res.status(200).json({
        sucess:true,
        message:"Product removed sucessfully",
    })
})