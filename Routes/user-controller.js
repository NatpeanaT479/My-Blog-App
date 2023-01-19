const { firebaseApp } = require("../index");
const { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const auth = getAuth(firebaseApp)
const { validationResult } = require("express-validator");
const { validateEmail } = require('../public/validateEmail');
const jwt = require("jsonwebtoken");
require("dotenv").config();

//Get registration page
const registerPage = (req,res) =>{
    res.render("register",{
        message:"Welcome! Please register using your email address and password"
    })
}

//Post request. Register user.
const registerUser = async(req,res) =>{
    const errors = validationResult(req);
    const email = req.body.email 
    const password= req.body.password
    const {valid} = await validateEmail(email)
    
    if (!valid || !errors.isEmpty()){
        res.status(400)
       return res.render("register",{ message: "Please provide a valid email address/password"}) 
    }
    try{
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log(user)
      res.redirect("/authentication/login")//Redirect user to login page if registration successgful

    }catch (error){
        res.status(406);
        res.render("register",{message: "Email already registered"})
      }
    }
    
//Display login page
const loginPage = (req,res) =>{
    res.render("login",{
        message: "Please login using your registered email and password"
    })
}   

//Post request. Login users
const loginUser = async (req,res) =>{
    const email = req.body.email 
    const password = req.body.password
    if(!email || !password){
       res.status(400)
       return res.render("login",{message: "Error! Email or password not provided."});
    }
    try{
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    const token = jwt.sign({ data:{ uid: user.uid, email: user.email}},process.env.JWT_AUTH_TOKEN,{expiresIn: "1hr"});
    res.cookie("accessToken", token, {httpOnly: true})
    console.log(`User with email:${email} logged in`)
    res.redirect("/myblog/main/homepage")

    }catch(error){
       res.status(400)
       res.render("login",{message: "Invalid email/password"})
    }
  
}

//Signout users from application
const logOut = async(req,res) =>{
    try{
        res.clearCookie("accessToken");
        console.log('user logged out')
        res.status(200);
        return res.redirect('myblog/authentication/login');
    }
    catch(error){
        res.status(500)
        return res.render("error",{
            message: error.message,
            status : "500 Internal Server Error",
            stack : error.stack 
    });
  }
}

module.exports= {
    registerPage,
    registerUser,
    loginPage,
    loginUser,
    logOut
}