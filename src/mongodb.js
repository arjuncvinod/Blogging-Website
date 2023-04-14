const mongoose = require("mongoose")
mongoose
  .connect("mongodb+srv://arjuncvinod:Arjuncvinod@123@arjun.advry0c.mongodb.net/myblog")
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log("failed to connect to db");
  });
const loginSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    type:{
      type:String,
      required:true
    }
})
const collection=new mongoose.model("login",loginSchema)
module.exports=collection 
