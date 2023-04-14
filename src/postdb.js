const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/myblog")
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