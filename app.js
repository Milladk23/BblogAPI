import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/userRoutes.js'

dotenv.config({ path: './config.env' });

const app = express();

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log('MongoDB has been conected');
  })
  .catch(err => console.log(err));

app.use(express.json());
app.use('/api/v1/users', userRouter);


const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1', () => {
    console.log('The server is running');
});

