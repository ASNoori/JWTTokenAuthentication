import userModel from "../models/registermodel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
//EMAIL ACTIVATION WHEN SIGNUP USING LINK
const signup = async (req, res) => {
  // checking if the user is already in database
  const emailExist = await userModel.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email already exists");
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    if (password === cpassword) {
      const registerUser = new userModel({
        fullname: req.body.fullname,
        email: req.body.email,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword,
        role: req.body.role,
      });
      console.log("the success part" + registerUser);
      const registered = registerUser.save();
      console.log("the page part" + registered);
      // res.send({status:200,message:'User Added Successfully',registerUser:registerUser._id});
      // res.send("user added");
      const token = await registerUser.generateAuthToken();
      console.log("token part:" + token);
      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: "nooriameer12@outlook.com",
          pass: "thisismymicrosoftacc!",
        },
      });
      const data = {
        from: "nooriameer12@outlook.com",
        to: registerUser.email,
        subject: "Account Activation Link",
        text: "Wow that's simple",
        html: `
            <h2>'Please click to activate your account'</h2>
           <a href=${process.env.CLIENT_URL}/authentication/activate/${token}>Activate Account</a>
            `,
      };

      transporter.sendMail(data, function (err, info) {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Sent: " + info.response);
        return res.json({
          message: "Email has been sent, kindly Activate your account",
        });
      });
    } else {
      res.send("Passwords are not matching");
    }
  } catch (error) {
    res.status(400).send(error);
    console.log("error part:" + error);
  }
};

const activateAccount = async (req, res) => {
  const { token } = req.body;
  try {
    if (token) {
      const verifyUser = jwt.verify(token, process.env.TOKEN_SECRET);
      console.log('VerifyUser:',verifyUser);
      const user = await userModel.findById(verifyUser._id);
      req.token = token;
      //cookie
      res.cookie("jwt", token, {
        // expires: new Date(Date.now() + 9000000),
        expiresIn:'20m',
        httpOnly: true
      });
      console.log(res.cookie);
      const updateUserInfo = await userModel.findByIdAndUpdate(user,{is_Verified:1})
      console.log(updateUserInfo);
      res.send('email verified');
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
};
export { signup, activateAccount };
