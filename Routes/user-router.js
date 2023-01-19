const express = require('express');
const UserRouter = express.Router();
const { check } = require("express-validator");
const { registerPage, registerUser, loginPage, loginUser } =require("./user-controller.js");

UserRouter.route("/registration")
        .get(registerPage)
        .post(check("email", "Email address must be provided").notEmpty().isEmail(), 
              check("password", "Password not strong enough").notEmpty().isStrongPassword({ minLength: 7, maxLength:10, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}),
        registerUser)

UserRouter.route("/login").get(loginPage).post(loginUser)


module.exports= {
    UserRouter
}
