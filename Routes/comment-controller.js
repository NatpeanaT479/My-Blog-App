const {firebaseApp} = require("../index.js");
const{getFirestore, collection,doc, updateDoc, getDoc, arrayUnion, arrayRemove} = require('firebase/firestore')
const db = getFirestore(firebaseApp);  ///need to be declare in content-controller rather than import from index.js for it work
const colref = collection(db, 'Blogs');//need to be declare in content-controller rather than import from index.js for it work
const asyncHandler = require("express-async-handler")

//Add comment to blog based document id. Each comment object contains other users' email address and their comment.
const addComment =  async(req,res) =>{
        const blogId = req.params.id //document id 
        const commentorEmail = req.user.email; //req.user.email from decoded data of jwt
        const comment = req.body.comment; //comment sent from html form
        if (!comment){
          return res.redirect("/myblog/main/blogs")
        }
        const commentObject = {commentor: commentorEmail, comment:comment} //to store each comment in object 
        console.log(commentObject)

        try{
                const blogRef = doc(colref,blogId) //gettting document reference
                await updateDoc(blogRef,{
                      comment: arrayUnion(commentObject)}, {merge:true}
                      )
                console.log(`A new comment has been added`)
                res.status(201)
                return res.redirect("/myblog/main/blogs")
        }catch(error){
                res.status(500)
                return res.render("error",{
                        message: error.message,
                        status : "Internal Server Error",
                        stack : error.stack 
                    })  
        }
     };

//Delete comments based on blog and comment id.(to keep for future use)
const delCommbyIndex = asyncHandler (async (req,res) =>{  
        const blogId = req.params.id 
        
        const commentId = req.query.commentId;
              //         endpoint: /comment/?commentId = * index of commentList*
       console.log(commentId, blogId)
        const blogRef= doc(colref, blogId)
        const docsSnapshot = await getDoc(blogRef)
        try{
            const commentList = docsSnapshot.get("comment")  //save comment data into commentList to get 
            const commentObject = commentList[commentId]
            console.log(commentObject)
            await updateDoc(blogRef,{
                comment: arrayRemove(commentObject) //remove object based on commentList index
              })
                console.log(`A comment was deleted`)
                res.status(200);
                return res.redirect('/myblog/main/my_blogs')
        }catch (error){
          console.log(error)
                res.status(500)
                return res.render("error",{
                        message: error.message,
                        status : "500 Internal Server Error",
                        stack : error.stack 
                    })  
                }
             }
)     
       
       
       
       
       
       
module.exports ={addComment, delCommbyIndex}












/*var form = document.getElementById('myForm');

form.addEventListener('submit', function(event) {
  event.preventDefault(); // prevent the form from being submitted

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/submit');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log(xhr.responseText);
    } else {
      console.error('An error occurred');
    }
  };
  xhr.send(new FormData(form)); // send the form data to the server
});*/