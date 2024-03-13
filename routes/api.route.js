const apiRoutes = require("express").Router();
const {

} = require('../controllers/user.controller')

apiRoutes.post('/post', post)

module.exports = apiRoutes;