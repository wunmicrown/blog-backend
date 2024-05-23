const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require('dotenv').config();

const URI = process.env.TEST_MONGODB_URI;

mongoose.connect(URI)
  .then(() => {
    console.log(`Connected to database successfully`);
  }).catch((err) => {
    console.log(`Error while connecting to database ${err}`);
  });

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    coverImgUrl: { type: String },
    content: { type: String },
    tags: [{ type: String }],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      default: "Published",
      enum: ["draft", "published"]
    },
    category_id: { type: Schema.Types.ObjectId, ref: "Category", key: "" },

    // Interactions
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Comments
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],

  },
  { timestamps: true }
);

// Model
let Post = mongoose.model("Post", postSchema);
module.exports = Post;