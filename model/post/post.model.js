const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    coverImgUrl: { type: String },
    content: { type: String },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    published: { type: Boolean },
    draft: { type: Boolean, default: false }, 

    category_id: { type: Schema.Types.ObjectId, ref: "Category" },

    // Interactions
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Comments
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    commentsCount: { type: Number, default: 0 } // New field for comment count

  },
  { timestamp: true }
);

//model
let Post = mongoose.model("Post", postSchema);
module.exports = Post;