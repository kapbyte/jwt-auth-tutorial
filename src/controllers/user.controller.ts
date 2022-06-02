import { Request, Response } from 'express';

/**
 * API endpoint to get protect data from the application.
 * @returns response with a success of false if user email already exists, or true if verification link is sent.
*/
const bookHistoryController = async (req: Request, res: Response) => {
  res.status(200).json({ 
    success: true, 
    message: `Book history valid`  
  });
};

export { bookHistoryController };