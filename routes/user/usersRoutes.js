const express = require("express");
const userController = require("../../controllers/users/user.controller");
const { ValidatorMDW } = require("../../validators/isAuthHandler");

const usersRouter = express.Router();

usersRouter.post("/register", ValidatorMDW, userController.register);
usersRouter.post("/login", ValidatorMDW, userController.login);
usersRouter.post("/verify-email", userController.verifyEmail);
usersRouter.post("/reset-email", userController.resetEmail);
usersRouter.post("/reset-password", ValidatorMDW, userController.resetPassword);


module.exports = usersRouter;