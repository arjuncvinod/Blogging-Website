const mongoose = require("mongoose");
mongoose
  .connect("mongodb+srv://arjuncvinod:Arjuncvinod@123@arjun.advry0c.mongodb.net/myblog")
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log("failed to connect to db");
  });
const postSchema = new mongoose.Schema({
    author: String,
    title: String,
    content: String,
    thumbnail:String,
    date:Number,
    like:Number,
    likedby:[String]
    });

const PosT = mongoose.model("post", postSchema);
module.exports = PosT
