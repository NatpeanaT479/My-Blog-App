const express = require('express');
const LikeRouter = express.Router();
const { addLike, removeLike } = require("./like-controller");
const { validCookieJwt } =require("../public/validCookieJwt");


LikeRouter.use(validCookieJwt);

LikeRouter.route("/:id").post(addLike).delete(removeLike);


module.exports= {
    LikeRouter
}

