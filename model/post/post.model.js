const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    image: {
      type: Object,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    published: { type: Boolean },
    imgUrl: { type: String },
    // Interactions
    likes: [{ type:Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type:Schema.Types.ObjectId, ref: "User" }],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Comments
    comments: { type: Array, default: [] },
  },
  { timestamp:true}
);

module.exports = mongoose.model("Post", postSchema);