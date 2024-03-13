const apiRoutes = require('./api.route');
const authRoutes = require('./auth.route');

const routers = require("express").Router();

routers.use("/auth", authRoutes)
routers.use("/api",  apiRoutes)


module.exports = routers;