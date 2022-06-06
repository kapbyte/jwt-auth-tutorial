import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { mailTransporter } from '../config/nodemailer';
import { 
  userCredentialRequestValidator,
  tokenRequestValidator,
  forgotPasswordRequestValidator,
  passwordResetRequestValidator
} from '../helpers/request.validator';

/**
 * API endpoint to signup a user.
 * @returns response with success of false if user email already exists, or true if verification link is sent.
*/
const userSignupController = async (req: Request, res: Response) => {
  const { error } = userCredentialRequestValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  // Check if user is already in DB
  if (user) {
    return res.status(200).json({ 
      success: false,
      message: 'Email already in use.'
    });
  }

  // Generate Token
  const token = jwt.sign({ email, password }, `${process.env.TOKEN_KEY}`, { expiresIn: '5m' });

  const mailOptions = {
    from: `${process.env.EMAIL_FROM}`, 
    to: `${email}`,
    subject: 'Account activation link.',
    html: `
      <p>Please copy and paste this link to postman.<b>( Activate account )</b></p>
      <a>${token}</a>
    `
  };

  // Send mail with defined transport object
  mailTransporter.sendMail(mailOptions, (error: any) => {
    if (error) {
      return res.status(500).json({ 
        success: false,
        message: `Something went wrong. Pls try again!` 
      });
    }
    res.status(200).json({ 
      success: true, 
      message: `Verification link sent to ${email}` 
    });
  });
};

/**
 * API endpoint to verify user signup token.
 * @returns response with a success of true if token is valid else false if invalid.
*/
const emailVerificationController = async (req: Request, res: Response) => {
  const { error } = tokenRequestValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const { token } = req.body;
  if (token) {
    try {
      const decodedToken = jwt.verify(token, `${process.env.TOKEN_KEY}`) as jwt.JwtPayload;
      const { email, password } = decodedToken;

      // Check if this user has gone through this process and is already in DB
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res.status(200).json({ 
          success: false,
          message: `${email} has already been verified.`
        });
      }

      // Hash user password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user and save to MongoDB
      const user = User.build({ 
        email: `${email}`, 
        password: `${hashedPassword}`
      });
      user.save();
      res.status(201).json({ success: true, id: user._id, message: 'User Registration Successful.' });
    } catch (error) {
      return res.status(400).json({ message: `${error}` });
    }
  } else {
    return res.status(408).json({ success: false, message: "No verification token attached." });
  }
};

/**
 * API endpoint to login a user.
 * @returns response with a success of true if login credentials are valid else false.
*/
const loginController = async (req: Request, res: Response) => {
  const { error } = userCredentialRequestValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const { email, password } = req.body;

  // Check for valid user email.
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Email does not exists."
    });
  }

  // Confirm found user password.
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid password."
    });
  }
  
  // Generate a token and send to client.
  const token = jwt.sign({ _id: user._id }, `${process.env.TOKEN_KEY}`, { expiresIn: '30m' });
  res.status(200).json({ 
    success: true, 
    message: 'Login Successful',
    token, 
    user: user._id 
  });
};

/**
 * API endpoint to send a forgot-password token to user.
 * @returns response with a success of true if token is sent to user's email else false.
*/
const forgotPasswordController = async (req: Request, res: Response) => {
  const { error } = forgotPasswordRequestValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Email does not exists."
    });
  }
  
  // Generate Password Reset Token
  const token = jwt.sign({ _id: user._id }, `${process.env.TOKEN_KEY}`, { expiresIn: '5m' });

  const mailOptions = {
    from: `${process.env.EMAIL_FROM}`, 
    to: `${email}`,
    subject: 'Forgot password link.',
    html: `
      <p>Please copy and paste this link to postman. <b>( Reset Password )</b></p>
      <a>${token}</a>
    `
  };

  // Send mail with defined transport object
  mailTransporter.sendMail(mailOptions, (error: any) => {
    if (error) {
      return res.status(500).json({ success: false, message: `Something went wrong. Pls try again!` });
    }
    res.status(200).json({ 
      success: true, 
      message: `Email has been sent to ${email}. Follow the instruction to set a new password.`  
    });
  });
};

/**
 * API endpoint to verify forgot-password token sent to user and reset password.
 * @returns response with a success of true if token is valid else false.
*/
const resetPasswordController  = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password1, password2 } = req.body;

  const { error } = passwordResetRequestValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  try {
    const payload = jwt.verify(token, `${process.env.TOKEN_KEY}`) as jwt.JwtPayload;

    // Validate password match
    if (password1 !== password2) {
      return res.status(400).json({
        success: false,
        message: `Password does not match!` 
      });
    }

    // Find user with id and update with new password
    const user = await User.findById(payload._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User ID not valid."
      });
    }

    // Hash password before update user document in DB
    const hashedPassword = await bcrypt.hash(password1, 10);
    user.password = hashedPassword;
    user.save();

    res.status(200).json({ 
      success: true,
      id: user._id,
      message: `Password update successful!` 
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: `${error}` });
  }
}

export { 
  userSignupController,
  emailVerificationController,
  loginController,
  forgotPasswordController,
  resetPasswordController
};