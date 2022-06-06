import { Request, Response } from 'express';

/**
 * API endpoint to get protected data from the application.
 * @returns response with a success of true if user has been authorized
*/
const userInfoController = async (req: Request, res: Response) => {
  res.status(200).json({ 
    success: true, 
    message: `Hello 👋, you've been authorized to access this endpoint.`  
  });
};

export { userInfoController };