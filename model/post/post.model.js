const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    coverImgUrl: {
      type: Object,
    },
    description: { type: String},
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    published: { type: Boolean },

    // Interactions
    likes: [{ type:Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type:Schema.Types.ObjectId, ref: "User" }],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Comments
    comments: [{ type: Schema.Types.ObjectId, ref: "comment" }],
  },
  { timestamp:true}
);

let Post = mongoose.model("Post", postSchema);
module.exports = Post;