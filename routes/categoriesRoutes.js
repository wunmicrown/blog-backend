const express = require("express");
const { TOKEN_MIDDLEWARE } = require("../middleWares/authenticateToken");
const categoryController = require("../controllers/categories/category.controller");

//!create instance express router
const categoriesRoutes = express.Router();

//-----Create category----

categoriesRoutes.post(
"/create",
TOKEN_MIDDLEWARE,
categoryController.createCategory
);

//----lists all categories----
categoriesRoutes.get("/", categoryController.fetchAllCategories);

//----update category----
categoriesRoutes.put("/:categoryId", TOKEN_MIDDLEWARE, categoryController.update
);

//--- get category---
categoriesRoutes.get("/:categoryId", categoryController.getCategory);

//---delete category---
categoriesRoutes.delete("/:categoryId",  TOKEN_MIDDLEWARE,  categoryController.delete );

//-----get all products of a category----
module.exports = categoriesRoutes;
