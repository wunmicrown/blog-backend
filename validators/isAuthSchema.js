const Joi = require("joi");



/** The validator for user register payload */
const registerPayloadValidator = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(40)
        .required(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{8,}$'))
        .required(),
    email: Joi.string().
        email().
        required(),
})
/** The Validator for user login payload */
const loginPayLoadValidator = Joi.object({
    email: Joi.string()
        .email()
        .required(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{8,}$'))
        .required(),

})

// The payload object for resetPasswordPayload
const resetPasswordlPayLoad = Joi.object({
    // email: Joi.string().email().required(),
    newPassword: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,}$')).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,}$')).required(),
    confirmPassword: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,}$')).required(),
    termsAccepted: Joi.boolean().required(),
});

/**
 * 
 * @param {Joi.ObjectSchema} validatorSchema 
 * @param {*} payload 
 * @returns object
 */
const schemaValidatorHandler = async (validatorSchema, payload) => {
    try {
        await validatorSchema.validateAsync(payload, { abortEarly: false });
        return { valid: true, error: null };
    } catch (error) {
        const { details } = error
        const messages = details.map(detail => detail.message)
        return { valid: false, error: messages }
    }
}



// The payload object for reset email
// const resetEmailPayLoad = Joi.object({
//     email: Joi.string().email().required(),

// })

// The payload object for verify Otp
// const verifyOTPPayLoad = Joi.object({
//     OTP: Joi.string().required(),
// })

// The payload object for resend Otp
// const resendOTPPayLoad = Joi.object({
//     OTP: Joi.string().required(),
// })





const wildCardValidator = Joi.object({})

module.exports = {
    schemaValidatorHandler,
    registerPayloadValidator,
    loginPayLoadValidator,
    resetPasswordlPayLoad,
    // resetEmailPayLoad,
    // verifyOTPPayLoad,
    // resendOTPPayLoad,
    // uploadFilePayLoad,
    wildCardValidator
};
