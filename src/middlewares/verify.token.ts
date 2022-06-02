import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // Verify request has token attached.
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Access denied!'
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const verified = jwt.verify(token, `${process.env.TOKEN_KEY}`);
    console.log('verified -> ', verified);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: `${error}`
    });
  }
};

export { verifyAuthToken };