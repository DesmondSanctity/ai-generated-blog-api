import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

export const authenticate = (
 req: Request,
 res: Response,
 next: NextFunction
) => {
 const authHeader = req.headers.authorization;

 if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return res.status(401).json({ message: 'Unauthorized: No token provided' });
 }

 const token = authHeader.split(' ')[1];

 try {
  const decoded = jwt.verify(token, SECRET_KEY) as {
   id: number;
   email: string;
  };
  req.user = decoded; // Assuming `user` is added to `Request` type in `@types/express`
  next();
 } catch (error) {
  return res.status(401).json({ message: 'Unauthorized: Invalid token' });
 }
};
