import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/userRoutes.js';
import postRouter from './routes/postRoutes.js';
import commentRouter from './routes/commentRoutes.js';

dotenv.config({ path: './config.env' });

const app = express();

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log('MongoDB has been conected');
  })
  .catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // برای form-data

app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/comments', commentRouter);


const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1', () => {
    console.log('The server is running');
});

