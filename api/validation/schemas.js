const Joi = require('joi');

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const orderSchema = Joi.object({
    
    customerName: Joi.string().min(2).required(),
    orderAmount: Joi.number().positive().required(),
    
});

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    next();
};

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    orderSchema,
};