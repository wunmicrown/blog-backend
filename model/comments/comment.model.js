const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  content: {
    type: String,
    required: true
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
},
  { timestamps: true }
);
let Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
