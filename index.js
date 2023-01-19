const { createServer } = require('http');
const express =require('express');
const methodOverride = require('method-override');
require('firebase/compat/auth');
require('firebase/compat/firestore');
const { getFirestore, collection } = require('firebase/firestore');
require("dotenv").config();
const path = require('path');
const {join} = require("path")
const cookieParser = require('cookie-parser');
const cors=require('cors');

//Configure firebase app to the blog project to use their services
const { initializeApp } = require("firebase/app");
const firebaseConfig = {
  apiKey: "AIzaSyDefAtuEJQUbJ9Ta20vp_aehxuo-elyAbI",
  authDomain: "my-blog-post-4fedc.firebaseapp.com",
  projectId: "my-blog-post-4fedc",
  storageBucket: "my-blog-post-4fedc.appspot.com",
  messagingSenderId: "917407536963",
  appId: "1:917407536963:web:3a2aac191181e290a681f6",
  measurementId: "G-2CNDN51EC7"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp); //connect to Cloud Firestore as the project database
const colref = collection(db, 'Blogs'); //'Blogs' is the collection reference in the db

//Importing routes from ./Routes
const { UserRouter } = require('./Routes/user-router.js');
const { ContentRouter } = require('./Routes/content-router.js');
const { LikeRouter } = require('./Routes/like-router.js');
const { CommentRouter } = require('./Routes/comment-router.js');


const port = process.env.PORT || 8000
const app = express();
app.set('views', join(__dirname, 'views')); //absolute path of 'views' directory that stores ejs
app.use(express.static(path.join(__dirname, './public'))); //absolute path of 'views' directory that stores css.file and javascript files
app.set('view engine', 'ejs');  //View engine enables the use of ejs files for the UI.
//app.use(express.json())
app.use(express.urlencoded ({extended: true}));//To parse incoming requests with urlencoded payloads from html forms
app.use(methodOverride('_method'))// To enable sending of request object with HTTP methods other than GET and POST.
app.use(cookieParser());//Parses cookies attached to the client request object.

const server = createServer(app);

server.listen(port,() =>{
    console.log(`Listening on port ${port}...`)
})

//Binding routes to the application
app.use("/myblog/authentication", UserRouter);
app.use("/myblog/main", ContentRouter);
app.use("/myblog/likes", LikeRouter);
app.use("/myblog/comment", CommentRouter);
app.use("/*", async (req,res)=>{
    if (req.cookies.accessToken){
      res.status(302);
      return res.redirect('/myblog/main/homepage')
    }
    else{
      res.redirect("/myblog/authentication/login")
    }
  })

module.exports= {
  firebaseConfig,
  firebaseApp,
  db,
  colref
}



