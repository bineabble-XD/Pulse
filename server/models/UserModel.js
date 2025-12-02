import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    phnum: { type: Number, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
  },
  { timestamps: true } // <-- gives createdAt, updatedAt
);

const UserModel = mongoose.model("pulseUsr", UserSchema, "pulseUsr");
export default UserModel;
