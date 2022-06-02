
import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());

// Routers
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');

app.use('/auth', authRouter);
app.use('/user', userRouter);

// Start server 
const startServer = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}`);
    app.listen(port, () => {
      console.log(`Server listening on port: ${port}`);
    })
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();