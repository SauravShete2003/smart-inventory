import User from "./../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const postSignup = async (req, res) => {
  const { username, password, rePassword, email, role} = req.body;
  if (!username){
    return res.status(400).json({ message: "username is required" });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  if (!rePassword) {
    return res.status(400).json({ message: "Confirm Password is required" });
  }
  if (password !== rePassword) {
    return res
      .status(400)
      .json({ message: "Password and Confirm Password should be same" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    password: await bcrypt.hash(password, hashedPassword),
    email,
    role
  });
  try {
    const savedUser = await user.save();
    res.status(201).json({
      message: "User created successfully Please Login!",
      data: {
        name: savedUser.username,
        email: savedUser.email,
        address: savedUser.address,
      },
    });
  } catch (error) {
    // console.log(error.keyValue);
    if (error.message.includes("duplicate key error")) {
      return res.status(400).json({
        succeess: false,
        message:`${Object.keys(error.keyValue)} '${Object.values(error.keyValue)}' already exists`,
      })
    }
    res.status(400).json({ message: error.message, succeess: false });
  }
};

const postLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid Email or Password" });
  }
  const isValidPassword = await bcrypt.compare(password, user.password);

  const userDetails =  {
     id: user._id, 
     email: user.email , 
     role : user.role , 
     _id : user._id,
     username : user.username,
    }

  if (!isValidPassword) {
    return res.status(400).json({ message: "Invalid Email or Password" });
  }
  const token = jwt.sign( userDetails,process.env.SECRET_KEY,{ expiresIn: "1h" });
  
  res.setHeader("Authorization" , `Bearer ${token}`);

  res.json({ message: "Login Successful", data : userDetails , token});

};
export { postSignup, postLogin };
