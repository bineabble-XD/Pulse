import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import UserModel from './models/UserModel.js';


const app = express();
app.use(cors());
app.use(express.json());

const connectionString =
  "mongodb+srv://admin:admin@students.ll5gldx.mongodb.net/PulseDb?appName=students";
  
mongoose
  .connect(connectionString)
  .then(() => {
    console.log("Database Connected..");

    app.listen(6969, () => {
      console.log("Server connected at port number 6969..");
    });
  })
  .catch((error) => {
    console.log("Database connection error: " + error);
  });