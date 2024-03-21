const express = require("express");
const { TOKEN_MIDDLEWARE } = require("../../middleWares/authenticateToken");
const categoryController = require("../../controllers/categories/category.controller");

//!create instance express router
const categoriesRouter = express.Router();

//-----Create category----

categoriesRouter.post(
"/create",
TOKEN_MIDDLEWARE,
categoryController.createCategory
);

//----lists all categories----
categoriesRouter.get("/", categoryController.fetchAllCategories);

//----update category----
categoriesRouter.put(
  "/:categoryId",
  TOKEN_MIDDLEWARE,
  categoryController.update
);

//--- get category---
categoriesRouter.get("/:categoryId", categoryController.getCategory);

//---delete category---
categoriesRouter.delete(
  "/:categoryId",
  TOKEN_MIDDLEWARE,
  categoryController.delete
);

//-----get all products of a category----
module.exports = categoriesRouter;
