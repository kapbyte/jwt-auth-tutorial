import Joi from "joi";

const userCredentialRequestValidator = Joi.object({ 
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required() 
});

const tokenRequestValidator = Joi.object({ 
  token: Joi.string().min(6).required()
});

const forgotPasswordRequestValidator = Joi.object({ 
  email: Joi.string().min(6).required().email()
});

const passwordResetRequestValidator = Joi.object({ 
  password1: Joi.string().min(6).required(),
  password2: Joi.string().min(6).required()
});

export { 
  userCredentialRequestValidator, 
  tokenRequestValidator, 
  forgotPasswordRequestValidator,
  passwordResetRequestValidator
};