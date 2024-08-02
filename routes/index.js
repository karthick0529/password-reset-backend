const express = require("express");
const User = require("../model/user");
const router = express.Router();
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/index");
const verifyToken = require("../middleware");
const nodemailer = require("nodemailer");

router.get("/test", (req, res) => {
  res.json({
    message: "API Testing Successfull.",
  });
});

router.post("/user", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json({
      message: "User created successfully.",
    });
  }
  res.status(404).json({
    message: "User already exists.",
  });
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "User not found.",
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      message: "Invalid credentials.",
    });
  }
  const token = generateToken(user);
  res.json({ token });
});

router.get("/data", verifyToken, (req, res) => {
  res.json({
    message: `welcome, ${req.user.email}! This is a protected data`,
    user: req.user,
  });
});

// router.post("/reset-password", async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) {
//     return res.status(404).json({
//       message: "User not found.",
//     });
//   }
//   const token = Math.random().toString(36).slice(-8);
//   user.resetPasswordToken = token;
//   user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
//   await user.save();

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   const message = {
//     from: process.env.EMAIL_USERNAME,
//     to: email,
//     subject: "Password Reset Request",
//     text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n Please use the following token to reset your password: ${token}\n\n If you did not request this, please ignore this email and your password will remain unchanged.\n`,
//   };

//   transporter.sendMail(message, (err, info) => {
//     if (err) {
//       return res.status(500).json({
//         message: "Error sending email.",
//       });
//     }
//     return res.status(200).json({
//       message: "Email sent successfully." + info.response,
//     });
//   });
// });

router.post("/reset-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "User not found.",
    });
  }
  const token = Math.random().toString(36).slice(-8);
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const resetUrl = `https://boisterous-faun-731be0.netlify.app/reset-password/${token}`;

  const message = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Password Reset Request",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n Please click the following link to reset your password: ${resetUrl}\n\n If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      return res.status(500).json({
        message: "Error sending email.",
      });
    }
    return res.status(200).json({
      message: "Email sent successfully. " + info.response,
    });
  });
});


router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(404).json({
      message: "Invalid token.",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  return res.status(200).json({
    message: "Password reset successful.",
  });
});
module.exports = router;
