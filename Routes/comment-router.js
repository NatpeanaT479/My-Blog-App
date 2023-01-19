const express = require('express');
//Middle to validate cookie and jwt before posting comments
const { validCookieJwt } = require("../public/validCookieJwt.js");
const { addComment,delCommbyIndex } = require("./comment-controller.js");
const CommentRouter = express.Router();

CommentRouter.use(validCookieJwt);

CommentRouter.route("/:id").post(addComment).delete(delCommbyIndex)

module.exports= {
    CommentRouter
}