const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const ejs = require("ejs");
const sessions = require("express-session");
// const collection = require("./mongodb");
const PosT = require("./postdb");
const Profile = require("./profiledb");
let imagename
const multer = require("multer");
const { send, title } = require("process");
const { profile } = require("console");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/thumbnails");
  },
  filename: (req, file, cb) => {
    // console.log(file);

    cb(null, file.originalname);
    imagename = file.originalname;
  },
});
const upload = multer({ storage: storage });
let user;
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
  sessions({
    secret: "secret key",
    saveUninitialized: true,
    resave: false,
  })
);

const visitSchema = new mongoose.Schema({
  visits: Number
});

const visits = mongoose.model("visits", visitSchema);

app.get("/home", (req, res) => {
  
  if (req.session.useremail) {
    PosT.find((err, results) => {
      req.session.result = results;
    });

    PosT.find((err, result) => {
      // console.log(req.session.sortedresult);
      res.render("home", {
        user: req.session.username,
        posts: req.session.result,
        date: Date.now(),
        sposts: result,
      });
    }).sort({ like: "desc" });
  } else {
    res.redirect("/")
  }
});
app.get("/", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.session.destroy(); 
  imagename=null
  res.redirect("/");
});
app.get("/signup",(req,res)=>{
  res.redirect("/")
})
app.post("/signup", async (req, res) => {

  const userExists = await Profile.exists({ username:req.body.name });
  // const loginData = {
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   type: "user",
  // };
  if(!userExists){
  const profileData = {
    username: req.body.name,
    email: req.body.email,
    password: req.body.password,
    type: "user",
    fullname:req.body.name,
    dp: "",
    bio: "",
    weblink: "",
    facebook: "",
    whatsapp: "",
    twitter: "",
    instagram: "",
    phoneno: "",
  };

  // await collection.insertMany(loginData);
  await Profile.insertMany(profileData)
  req.session.useremail = req.body.email;
  req.session.username = req.body.name;
  res.redirect("/home");
}else{
  res.send("<script>alert('user already exits');window.location.href = '/'</script>");

}
});

app.post("/login", async (req, res) => {
  try {
    const check = await Profile.findOne({ email: req.body.email });
    if (check.password === req.body.password) {
      if (check.type === "admin") {
        req.session.useremail = check.email;
        req.session.username = check.username;
        req.session.type = "admin"
        res.redirect("admin")
      } else {
        visits.findOneAndUpdate(
          { _id: "640cb99cd1ab2ecb248598b4" },
          { $inc: { visits: 1 } },
          (err) => {});
        req.session.useremail = check.email;
        req.session.username = check.username;
        req.session.type = "user"
        console.log(req.session.user);
        res.redirect("home");
      }
    } else {
      res.send("<script>alert('Wrong Password');window.location.href = '/'</script>");
    }
  } catch {
    res.send("<script>alert('Wrong details');window.location.href = '/'</script>");
  }
});

app.get("/compose", (req, res) => {
  if(req.session.username){
  res.render("compose", { user: req.session.username });
  }
});
app.post("/compose", upload.single("image"), async (req, res) => {
  const postData = {
    author: req.session.username,
    title: req.body.postTitle,
    content: req.body.postBody,
    thumbnail: imagename,
    date: Date.now(),
    like: 0,
  };
  await PosT.insertMany(postData);
  res.redirect("/home");
});
app.get("/posts/:custom", (req, res) => {
   if(req.session.username){
  PosT.find((err, results) => {
    res.render("posts", {
      user: req.session.username,
      posts: results,
      date: Date.now(),
      id: req.params.custom,
    });
  });
}else{
  res.render("notfound")
}
});
app.post("/posts/:custom", (req, res) => {
  const id = req.params.custom;
  var userid = req.session.username;

  PosT.findOne({ _id: { $eq: id } }, (err, result) => {
    if (result.likedby.includes(userid)) {
      PosT.findOneAndUpdate(
        { _id: id },
        { $pull: { likedby: userid } },
        { new: true }
      ).exec((err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log("user disliked");

          PosT.findOneAndUpdate({ _id: id }, { $inc: { like: -1 } }, (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("updated");
            }
          });
        }
      });
    } else {
      PosT.findOneAndUpdate(
        { _id: id },
        { $push: { likedby: userid } },
        { new: true }
      ).exec((err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log("user liked");
          PosT.findOneAndUpdate({ _id: id }, { $inc: { like: 1 } }, (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("updated");
            }
          }); //
        }
      });
    }
    if (err) {
      console.log(err);
    }
  });
});

app.get("/update/:custom",(req,res)=>{
   if(req.session.username){
  PosT.findById(req.params.custom,(err,result)=>{
    console.log(result);
     if(req.session.username===result.author||req.session.username==="admin"){
    res.render("edit-post",{user:req.session.username,post:result})
     }else{
      res.render("notfound")
     }
  })
}
})
app.post("/update/:custom", upload.single("image"), async (req, res) => {
  PosT.findByIdAndUpdate(
    req.params.custom,
    {
      title:req.body.postTitle,
      content: req.body.postBody,
      thumbnail: imagename,
    },
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
  res.redirect("/posts/" + req.params.custom);
});

app.get("/delete/:custom", (req, res) => {
 if(req.session.username){
  PosT.findById(req.params.custom,(err,results)=>{
     if (
       req.session.username === results.author ||
       req.session.type === "admin"
     ){
       PosT.findByIdAndRemove(req.params.custom, (err) => {
         console.log("deleted");
         if (req.session.username === "admin") {
           res.redirect("/admin");
         } else {
           res.redirect("/home");
         }
       });
      }else{
        res.render("notfound")
      }
  })
  
}else{
  res.redirect("/")
}
});


app.get("/profile/:customRoute", (req, res) => {

  if(req.session.username){
  const customRoute = req.params.customRoute;
// Profile.findOne({username:req.session.username},(err,result)=>{
//   if(err){
//     console.log(err);
//   }else{
//   console.log(result.dp); 
//   }
// })

  PosT.find({ author: customRoute}, (err, result)=> {
    if (err){
        console.log(err);
        
    }
    else{
        req.session.userposts=result;
        Profile.findOne({username:customRoute},(err,results)=>{
          res.render("profile", {
          username: req.session.username,
          posts: req.session.userposts,
          userdata:results,
          date: Date.now(),
        });
        // console.log(results);
        })
        
        
    }})
    // console.log(req.session.userposts);
  }else{
    res.redirect("/")
  }
});


app.get("/editprofile/:custom",(req,res)=>{
  if(req.session.username){
     Profile.findOne({username:req.params.custom},(err,results)=>{
     if (req.session.username === results.username){
  Profile.findOne({username:req.session.username},(err,result)=>{
    res.render("edit-profile",{username:req.session.username,email:req.session.useremail,userdata:result})
  })}else{
    res.render("notfound")
  }})
}else{
  res.redirect("/")
}
})


app.post("/editprofile/:custom",upload.single("image"), async (req, res) => {
  const custom=req.params.custom 

 
// console.log(imagename);
  Profile.findOneAndUpdate(
    { username: req.session.username },
    {
      fullname: req.body.fullname,
      email: req.session.useremail,
      dp: imagename,
      bio: req.body.bio,
      weblink: req.body.weblink,
      facebook: req.body.fb,
      whatsapp: req.body.wa,
      twitter: req.body.tw,
      instagram: req.body.insta,
      phoneno: req.body.phno,
    },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("updated");
      }
    }
  );


  res.redirect("/profile/"+custom);
});

app.get("/admin",(req,res)=>{
  if(req.session.type==="admin"){
  // collection.find((err,logins)=>{
    Profile.find((err,profiles)=>{
      PosT.find((err,posts)=>{
        visits.find((err,visits)=>{
         res.render("admin",{profiles:profiles,posts:posts,visits:visits,username:req.session.username});
        })
      })
    })
  }else{
    res.redirect("/")
  }
  // })
 
})

app.get("/removeuser/:custom", (req, res) => {
  if(req.session.type==="admin"){
  Profile.findByIdAndRemove(req.params.custom, (err) => {
    PosT.deleteMany({author:{$eq:req.query.user}},(err)=>{
      if(err){
        console.log(err);
      }else{
        res.redirect("/admin")
      }
    })
  });
}else{
  res.render("notfound")
}
});




app.post("/search",async(req,res)=>{
  let payload=req.body.payload.trim()
  // console.log(payload);
  let search=await PosT.find({title:{$regex: new RegExp('^'+payload+'.*','i')}}).exec();
  search = search.slice(0,10)
  // console.log(search);
  res.send({payload:search})

})

app.get("/:custom", (req, res) => {
  res.render("notfound")
});
app.get("/:custom/:custom2",(req,res)=>{
  res.render("notfound")
})

app.listen(3000, () => {
  console.log("server started at port 3000");
});
