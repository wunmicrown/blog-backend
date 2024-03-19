const {
    registerPayloadValidator, 
    loginPayLoadValidator,
    schemaValidatorHandler,
    resetPasswordlPayLoad
} = require("./isAuthSchema");


/**
 * 
 * @param {string} path  request path name
 * @returns Joi.object
 */
const authSchemaMapper = (path) => {
    switch (path) {
        case "/register":
            return registerPayloadValidator
        case "/login":
            return loginPayLoadValidator
            case "/reset-password":
                return resetPasswordlPayLoad
        // case "/resetEmail":
        //     return resetEmailPayLoad
        // default:
        //     return wildCardValidator

    }
}

const ValidatorMDW = async (req, res, next) => {
    const { path } = req.route
    const validatorSchema = authSchemaMapper(path)
    const { valid, error } = await schemaValidatorHandler(validatorSchema, req.body)
    if (!valid) {
        return res.status(400).json(error);
    }

    next()
}

module.exports = {
    authSchemaMapper,
    ValidatorMDW
}