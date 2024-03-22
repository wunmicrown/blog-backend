const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//schema
const categorySchema = new Schema(
  {
    // name: { type: String, required: true },
    description: { type: String },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  },
  {
    timestamps: true,
  }
);
//model
let Category = mongoose.model("Category", categorySchema);
module.exports = Category;
