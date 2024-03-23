const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
},
  { timestamps: true }
);
let Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
