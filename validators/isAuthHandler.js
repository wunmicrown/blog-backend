const {
    registerPayloadValidator
} = require("./isAuthSchema");


/**
 * 
 * @param {string} path  request path name
 * @returns Joi.object
 */
const SchemaMapper = (path) => {
    switch (path) {
        case "/register":
            return registerPayloadValidator
        case "/signin":
            return signinPayLoadValidator
        case "/resetEmail":
            return resetEmailPayLoad
        case "/resetpassword":
            return resetPasswordlPayLoad
        default:
            return wildCardValidator

    }
}

const ValidatorMDW = async (req, res, next) => {
    const { path } = req.route
    const validatorSchema = SchemaMapper(path)
    const { valid, error } = await schemaValidatorHandler(validatorSchema, req.body)
    if (!valid) {
        return res.status(400).json(error);
    }

    next()
}

module.exports = {
    SchemaMapper,
    ValidatorMDW
}