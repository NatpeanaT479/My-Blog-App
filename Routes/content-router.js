const express = require('express');
const { validCookieJwt } = require("../public/validCookieJwt.js");
const {logOut} =require("./user-controller");
const { homePage, 
        createBlogPage, 
        createBlog,
        updateBlogForm, 
        getBlogs, 
        BlogTitlesbyUId, 
        getBlogbyDocId, 
        updateBlog, 
        deleteBlog, 
        updateBlogImage, 
        updateBlogText} = require("./content-controller.js");
const ContentRouter = express.Router();
const multer  = require("multer"); //middleware to handle multipart-form data in html form where files will be sent
const multerStorage = multer.memoryStorage(); //The memory storage engine stores the files in memory as Buffer objects
const upload = multer({storage:multerStorage}).single("image"); //to upload image files in create and update blog forms

//Validate cookie with jwt before using the app
ContentRouter.use(validCookieJwt);

ContentRouter.route("/homepage").get(homePage);

ContentRouter.route("/blogs").get(getBlogs)

ContentRouter.route("/create_blog").get(createBlogPage).post(upload, createBlog);

ContentRouter.route("/my_blogs").get(BlogTitlesbyUId);

ContentRouter.route("/my_blogs/:id").get(getBlogbyDocId);

ContentRouter.route("/delete_blog/:id").delete(deleteBlog);

ContentRouter.route("/update_blog/:id").get(updateBlogForm).put(updateBlog);

ContentRouter.route("/update_blogimage/:id").put(upload, updateBlogImage);

ContentRouter.route("/update_blogtext/:id").put(updateBlogText);

ContentRouter.route("/logout").get(logOut);



          
module.exports= {
    ContentRouter
}


