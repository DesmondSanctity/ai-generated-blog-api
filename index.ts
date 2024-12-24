import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { authenticate } from './middlewares/authenticate';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

app.use(bodyParser.json());

// Route to create a new blog post
app.post('/posts', authenticate, async (req: Request, res: Response) => {
 const { title, body, tags, status } = req.body;

 if (!title || !body || !status) {
  return res
   .status(400)
   .json({ message: 'Title, body, and status are required' });
 }

 if (status !== 'draft' && status !== 'published') {
  return res
   .status(400)
   .json({ message: 'Status must be either draft or published' });
 }

 if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
  return res.status(400).json({ message: 'Tags must be an array of strings' });
 }

 try {
  const post = await prisma.post.create({
   data: {
    title,
    body,
    tags,
    status,
    userId: req.user.id,
   },
  });

  res.status(201).json(post);
 } catch (error) {
  if (error.code === 'P2002') {
   // Prisma unique constraint error
   res.status(400).json({ message: 'A post with this title already exists' });
  } else {
   console.error(error);
   res
    .status(500)
    .json({ message: 'Unexpected error occurred while creating post' });
  }
 }
});

// Route to get all published posts
app.get('/posts', async (req: Request, res: Response) => {
 const { page = 1, limit = 10 } = req.query;

 const pageNumber = parseInt(page as string, 10);
 const limitNumber = parseInt(limit as string, 10);

 if (
  isNaN(pageNumber) ||
  isNaN(limitNumber) ||
  pageNumber < 1 ||
  limitNumber < 1
 ) {
  return res.status(400).json({ message: 'Invalid pagination parameters' });
 }

 try {
  const posts = await prisma.post.findMany({
   where: { status: 'published' },
   select: {
    id: true,
    title: true,
    body: true,
    tags: true,
    createdAt: true,
   },
   skip: (pageNumber - 1) * limitNumber,
   take: limitNumber,
  });

  const totalPosts = await prisma.post.count({
   where: { status: 'published' },
  });

  res.status(200).json({
   posts,
   currentPage: pageNumber,
   totalPages: Math.ceil(totalPosts / limitNumber),
  });
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Error fetching posts' });
 }
});

// Route to get a single published post
app.get('/posts/:id', async (req: Request, res: Response) => {
 const { id } = req.params;

 const parsedId = parseInt(id, 10);
 if (isNaN(parsedId)) {
  return res.status(400).json({ message: 'Invalid post ID' });
 }

 try {
  const post = await prisma.post.findUnique({
   where: { id: parsedId },
  });

  if (!post || post.status !== 'published') {
   return res.status(404).json({ message: 'Post not found' });
  }

  res.status(200).json(post);
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Error fetching post' });
 }
});

// Start the server
app.listen(PORT, () => {
 console.log(`Server is running on http://localhost:${PORT}`);
});
