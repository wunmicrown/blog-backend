const express = require("express");
const userController = require("../../controllers/users/user.controller");
const { ValidatorMDW } = require("../../validators/isAuthHandler");

const usersRouter = express.Router();

usersRouter.post("/register", ValidatorMDW, userController.register);
usersRouter.post("/login", ValidatorMDW, userController.login);
usersRouter.post("/verify-email", userController.verifyEmail);


module.exports = usersRouter;