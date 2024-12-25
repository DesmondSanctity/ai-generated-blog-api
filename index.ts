import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { authenticate } from './middlewares/authenticate';
import {
 validateCreatePost,
 validatePagination,
 validatePostId,
} from './validations';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Route to create a new blog post
app.post(
 '/posts',
 authenticate,
 async (req: Request, res: Response): Promise<void> => {
  const validationErrors = validateCreatePost(req.body);
  if (validationErrors.length > 0) {
   res.status(400).json({ errors: validationErrors });
   return;
  }

  try {
   const post = await prisma.post.create({
    data: {
     title: req.body.title,
     body: req.body.body,
     tags: req.body.tags,
     status: req.body.status,
     userId: req.user.id,
    },
   });

   res.status(201).json(post);
  } catch (error) {
   res
    .status(500)
    .json({ message: 'Unexpected error occurred while creating post' });
  }
 }
);

// Route to get all published posts
app.get('/posts', async (req: Request, res: Response): Promise<void> => {
 const { errors, pageNumber, limitNumber } = validatePagination(req.query);

 if (errors.length > 0) {
  res.status(400).json({ errors });
  return;
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
app.get('/posts/:id', async (req: Request, res: Response): Promise<void> => {
 const { error, parsedId } = validatePostId(req.params.id);

 if (error) {
  res.status(400).json({ message: error });
  return;
 }

 try {
  const post = await prisma.post.findUnique({
   where: { id: parsedId },
  });

  if (!post || post.status !== 'published') {
   res.status(404).json({ message: 'Post not found' });
   return;
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
