import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY!;

export const authenticate = (
 req: Request,
 res: Response,
 next: NextFunction
): void => {
 const authHeader = req.headers.authorization;

 if (!authHeader || !authHeader.startsWith('Bearer ')) {
  res.status(401).json({ message: 'Unauthorized: No token provided' });
  return;
 }

 const token = authHeader.split(' ')[1];

 try {
  const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] }) as {
   id: number;
   email: string;
  };
  req.user = decoded;
  next();
 } catch (error) {
   res.status(401).json({ message: 'Unauthorized: Invalid token' });
   return;
 }
};
