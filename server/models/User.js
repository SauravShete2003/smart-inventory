import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role :{
    type:String,
    enum: ["admin", "manager", "employee"],
    default: "employee",
  }
},{
  timestamps: true
});

const User = model("User", userSchema);
export default User;
