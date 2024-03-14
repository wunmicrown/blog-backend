
const authRoutes = require  ("express").Router();
const { signup } = require("../controllers/user.controller");

// //routes Define
authRoutes.post('/signup', signup)

module.exports = authRoutes;