const BigPromse = require("../middlewares/BigPromise")

exports.home = BigPromse((req,res) =>{
    res.status(200).json({
        sucess:true,
        message:"hello from home"
    })
})
exports.homeDummy = (req,res) =>{
    res.status(200).json({
        sucess:true,
        message:"hello from home dummy"
    })
}