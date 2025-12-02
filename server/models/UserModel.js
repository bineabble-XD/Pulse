import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    phnum: { type: Number, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    profilePic: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    username: { type: String, required: true, unique: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "pulseUsr" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "pulseUsr" }],
  },
  { timestamps: true }
);

const UserModel = mongoose.model("pulseUsr", UserSchema, "pulseUsr");
export default UserModel;
