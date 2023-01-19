//Validate cookies containing jwt created when user logs in the application
const jwt = require("jsonwebtoken");
require("dotenv").config();//to acquire JWT_AUTH_TOKEN for jwt verification

const validCookieJwt = (req,res,next) =>{
    const accessToken = req.cookies.accessToken //accessToken is the name given the cookie created when user logs in.
    //If no accessToken, user must login first before using the app.
    if (!accessToken){
        return res.redirect("/myblog/authentication/login")
    }
    try{
        //Verifying cookie with stored jwt
        const data = jwt.verify(accessToken, process.env.JWT_AUTH_TOKEN, (err, decoded)=>{
            if(err){
                    res.status(401);
                    throw new Error("User is not authorized")
                  }
            //req.user stores decoded jwt payload
            req.user = decoded.data
           // req.userId = data.uid
           // req.userEmail = data.email
            })
        return next()
    }catch{
        res.status(403).render("login",{message:"Please login with your email and password"})
       }
    }

module.exports= {
    validCookieJwt
}

