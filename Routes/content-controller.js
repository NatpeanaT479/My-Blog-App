const {firebaseApp} = require("../index.js");
//Import Cloud Firestore functions
const { getFirestore, doc, collection, query, where, orderBy, startAfter, limit, getDoc, getDocs, addDoc, updateDoc, deleteDoc } = require("firebase/firestore");
//Import cloud storage funcions for Firebase to upload and store files
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const db = getFirestore(firebaseApp);  ///need to be declare in content-controller rather than import from index.js for it work
const colref = collection(db, 'Blogs');//need to be declare in content-controller rather than import from index.js for it work

let lastVisible = null //variable use in paginating blogs

//Render home page after user logs in
const homePage = (req,res) => {
    res.render("homepage")
}

//Directing user to create blog page after clicking on create blog button
const createBlogPage = (req,res) =>{
    res.render("create-blog",{
        message: "Create Your Blog Post"
    })
}

//Update blog based on blog id page
const updateBlogForm = async(req,res)=>{
     try{
    const blogRef = doc(colref, req.params.id);
    const docsSnapshot = await getDoc(blogRef); //to read document data
    console.log(docsSnapshot.id)
    res.status(200);
    //render html forms with blog data. Prevents sending empty form
    return res.render("update-blog",{
        message:"Fill in the fields you want to update.",
        docsSnapshot : docsSnapshot.id,
        blogtitle : docsSnapshot.data().blogTitle,
        blogsubheader: docsSnapshot.data().blogSubheader,
        imagetitle : docsSnapshot.data().imageTitle,
        blog: docsSnapshot.data().blog
        });
    }catch(error){
        res.status(500)
            return res.render("error",{
                message: error.message,
                status : "500 Internal Server Error",
                stack : error.stack 
            });
          };
        }

//Pagination for blogs. Display one blog each time user clicks on 'next' button
const getBlogs = async(req,res)=>{
    try{
        while(true){
            //Display one queried document per page
            const pageSize = 1 
            //for the first page the lastVisible is null as there is no previous blog.
            let blogQuery = query(colref, orderBy("blogTitle"), startAfter(lastVisible || 0), limit(pageSize));
            let docsSnapshot = await getDocs(blogQuery);   
            //After user clicks on the next button lastVisible stores the current document for query to start after
            lastVisible = docsSnapshot.docs[docsSnapshot.docs.length - 1];

            if (docsSnapshot.docs.length > 0){
            res.status(200);
            return res.render("pagination", {
                    docsSnapshot: docsSnapshot})
    } else{
        return res.redirect("/myblog/main/homepage")
    } 
    }
     }catch(error){
            res.status(500)
            return res.render("error",{
                message: error.message,
                status : "500 Internal Server Error",
                stack : error.stack 
            });
          }
    
        }

//Create blog based on data collected form created-blog page and add to firestore collection
const createBlog = async (req,res)=>{
    const blogtitle = req.body.blogtitle 
    const blogsubheader = req.body.blogsubheader 
    const blog = req.body.blog 
    const imagetitle = req.body.imagetitle
    console.log(req.user.email) 
    
    
    if (!blogtitle || !blogsubheader || !blog || !imagetitle || !req.file){
        res.status(400)
        return res.render("create-blog",{
            message:"All fields must be filled!"
          });
    }
        try{
            const fileName = req.file.originalname //name of image file
            //Intialize Cloud Storage and get reference to the service
            const storage = getStorage(firebaseApp,"my-blog-post-4fedc.appspot.com"); 
            //create storage reference
            const storageRef = ref(storage,fileName, req.file.mimetype);
            const metadata ={contentType: req.file.mimetype};

            const uploadTask = uploadBytesResumable(storageRef, req.file.buffer, metadata);
            uploadTask.on(
            "state_changed",
            //snapshot is an immutable view of the task at the time the event occurred. 
            (snapshot) =>{
                const uploaded = Math.floor((snapshot.bytesTransferred/snapshot.totalBytes) * 100);
                console.log(uploaded);//displays file upload progress
            },
            (error)=>{
              console.log(`Error ${error}`);
            },
               async() => {
                //aqcuiring image URL to be stored in collection
                const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                console.log(`The url ${imageUrl}`)
                const data = {
                    blogTitle: blogtitle,
                    blogSubheader: blogsubheader,
                    blog: blog,
                    imageTitle: imagetitle,
                    image: imageUrl,
                    comment: [], 
                    likes: 0, 
                    userEmail: req.user.email,
                    userId: req.user.uid
                };
                console.log(data)
                const snapshot_add = await addDoc(colref,data);
            });
                    res.status(201)
                    return res.render("create-blog",{
                        message: "Your new blog has been created."
                    })
                 }catch(error){
                    res.status(400)
                    return res.render("create-blog",{
                        message: "Error! Blog not created"})
                    }
                 };
                
            
    
//Get blog titles based on user id
const BlogTitlesbyUId = async(req,res) =>{
    const userId = req.user.uid
    //query document based on uid.
    const blogsQuery = query(colref, where("userId", "==", userId));
    const docsSnapshot = await getDocs(blogsQuery);
    if (docsSnapshot.empty){
         res.status(404)
        return res.render("no-blogs")
       }
        try{
         res.status(200)
         return res.render("user-blogs",{
            message: "Welcome to your blogs",
            docsSnapshot : docsSnapshot   
        
    })
    }catch(error){
        res.status(500)
        return res.render("error",{
            message: error.message,
            status : "500 Internal Server Error",
            stack : error.stack 
        })
      }
    }
//Get blog based on document id to be read in user profile
const getBlogbyDocId = async(req,res) =>{
    const blogId = req.params.id
    const docRef= doc(colref, blogId)
    const snapshotDoc = await getDoc(docRef)
    if (snapshotDoc.empty) {
        res.status(404)
        return res.render("no-blogs")
    }
    try{
    const commentList = snapshotDoc.data().comment
        res.status(200)
        return res.render("display-blog",{
            userEmail: snapshotDoc.data().userEmail,
            blogtitle : snapshotDoc.data().blogTitle,
            blogsubheader :snapshotDoc.data().blogSubheader,
            blog : snapshotDoc.data().blog,
            imagetitle : snapshotDoc.data().imageTitle,
            image : snapshotDoc.data().image,
            comment: commentList,
            likes : snapshotDoc.data().likes,
            blogId: snapshotDoc.id 
        })
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

//To update blog title, subheader, and image title by document id 
const updateBlog = async(req,res) =>{
    const blogId = req.params.id
    const blogRef = doc(colref, blogId);
    const {blogtitle,blogsubheader,imagetitle} = req.body
    if (!blogtitle || !blogsubheader || !imagetitle){
        res.status(400)
        return res.redirect(`myblog/main/update_blog/${blogId}`)
          };
     console.log("Update commencing")
    try{
       await updateDoc(blogRef,{
            blogTitle : blogtitle,
            blogSubheader: blogsubheader,
            imageTitle: imagetitle,
        });
        console.log(`Blog with id:${blogId} has been updated`);
         res.status(200);
        return res.redirect('/myblog/main/my_blogs');
        }catch (error){
            res.status(400)
            return res.render("update-blog",{
                message: `Error! ${error}. Blog not updated`})
            }   
        }
 //Update blog image as per document id (own separate functionality to avoid sending empty file)
    const updateBlogImage = async(req,res)=>{
          const blogId = req.params.id
          const blogRef= doc(colref, blogId);
          if (!req.file){
        res.status(400)
        return res.redirect(`/myblog/main/update_blog/${blogId}`)
          };
        try{
            const fileName = req.file.originalname
            const storage = getStorage(firebaseApp,"my-blog-post-4fedc.appspot.com");
            const storageRef = ref(storage,fileName, req.file.mimetype);
            const metadata ={contentType: req.file.mimetype};
            const uploadTask = uploadBytesResumable(storageRef, req.file.buffer, metadata);
            uploadTask.on(
            "state_changed",
            (snapshot) =>{
                const uploaded = Math.floor((snapshot.bytesTransferred/snapshot.totalBytes) * 100);
                console.log(uploaded);
            },
            (error)=>{
              console.log(`Error ${error}`);
            },
               async() => {
                const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                console.log(`The url ${imageUrl}`)
                await updateDoc(blogRef,{
                    image: imageUrl});
            });
                    res.status(200)
                    console.log(`Blog with id:${blogId} has been updated`)
                    return res.redirect('/myblog/main/my_blogs');
                 }catch(error){
                    res.status(400)
                    return res.render("create-blog",{
                        message: "Error! Blog not created"})
                    }
                 }

//Update blog text as per document id (own separate functionality to avoid sending empty blog text)
    const updateBlogText = async(req,res)=>{
        const blogId = req.params.id
        const blogRef= doc(colref, blogId);
        try{
            await updateDoc(blogRef,{
                blog: req.body.blog
            });
            console.log(`Blog with id:${blogId} has been updated`)
            res.status(200);
            return res.redirect('/myblog/main/my_blogs');
        }catch(error){
            res.status(500)
            return res.render("error",{
                message: error.message,
                status : "500 Internal Server Error",
                stack : error.stack 
            })
        }
    }

// To delete blog by document id
const deleteBlog = async(req,res) =>{
    try{    
    const blogId = req.params.id
    const blogRef = doc(colref, blogId)
    await deleteDoc(blogRef)
    console.log(`Blog with id: ${blogId} has been deleted.`)
    return res.redirect("/myblog/main/homepage")
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


module.exports = {
    homePage,
    createBlogPage,
    createBlog,
    updateBlogForm,
    getBlogs,
    BlogTitlesbyUId,
    getBlogbyDocId,
    updateBlog,
    updateBlogImage,
    updateBlogText,
    deleteBlog
}
