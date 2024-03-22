const express = require("express");
const userController = require("../controllers/users/user.controller");
const { ValidatorMDW } = require("../validators/isAuthHandler");
const { TOKEN_MIDDLEWARE } = require("../middleWares/authenticateToken");
const { multerCloudUploader } = require("../middleWares/multerUpload");

const usersRouter = express.Router();

usersRouter.post("/register", ValidatorMDW, userController.register);
usersRouter.post("/login", ValidatorMDW, userController.login);
usersRouter.post("/verify-email", userController.verifyEmail);
usersRouter.post("/reset-email", userController.resetEmail);
usersRouter.post("/reset-password", ValidatorMDW, userController.resetPassword);
usersRouter.post("/change-password", userController.changePassword);
usersRouter.post("/change-email", TOKEN_MIDDLEWARE, userController.changeEmail);

usersRouter.post( "/create/uploads",TOKEN_MIDDLEWARE,multerCloudUploader.single("image"),
    userController.uploadProfilePicture);


module.exports = usersRouter;