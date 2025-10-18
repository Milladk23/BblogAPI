import mongoose from 'mongoose';
import dotenv from 'dotenv';

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! and We are Shutting Down...');
    console.log(err);
    process.exit(1);
});

dotenv.config({ path: './config.env' });

import app from "./app";

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log('MongoDB has been conected');
  })
  .catch(err => console.log(err));

const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1', () => {
    console.log('The server is running');
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! and We are Shutting Down...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED, shutting down gracefully');
  server.close(() => {
    console.log(' Process terminated');  
  });
});