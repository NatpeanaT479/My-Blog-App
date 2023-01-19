//like button: when user clicks on like button, number of likes increases but if click again number likes decreases
const { firebaseApp } = require("../index.js");
const { collection,doc, getFirestore,increment, updateDoc } = require("firebase/firestore");
const db = getFirestore(firebaseApp);  ///need to be declare in content-controller rather than import from index.js for it work
const colref = collection(db, 'Blogs');


//add a like

const addLike = async(req,res) =>{
  const blogId = req.params.id
  const blogRef = doc(colref,blogId)
   await updateDoc(blogRef,{
    likes: increment(1)
});
}

//remove a like
const removeLike = async(req,res) =>{
  const blogId = req.params.id
  const blogRef = doc(colref,blogId)
   await updateDoc(blogRef,{
    likes: increment(-1)
  });
}

module.exports= {
  addLike,
  removeLike
}


