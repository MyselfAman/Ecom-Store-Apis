const cookieToken =  function(user , res){
    const token = user.getJwtToken();
    user.password=undefined;
    res.status(201)
    .cookie('token',token , {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRY_DAY *24 * 60 *60 *1000),
        httpOnly:true
    }).json({
        status: "sucess",
        user,
        token
    })
}




module.exports =  cookieToken