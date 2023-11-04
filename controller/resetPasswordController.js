const User = require("../model/User");
const bcrypt = require("bcrypt");

const otpVerification = async (req, res) => {
  // http method GET
  const { resetCode, resetTime } = req.body;


  if (!(typeof resetCode === "number")) {
    return res.status(400).json({ message: " number type needed on otp" });
  }

  if (!resetCode) return res.status(400).json({ message: "OTP code required" });

  const findOTPmatchUser = await User.findOne({ resetCode }).exec();
  if (!findOTPmatchUser)
    return res.status(400).json({ message: "no such OTP matched" });

  if (findOTPmatchUser.resetTime < resetTime) {
    return res.status(401).json({ message: "reset time expired" });
  }

  res.json({ message: "opt verified" });

  // end of line
};

//
const passwordReset = async (req, res) => {
  // HTTP method PATCH
  const { resetCode, password } = req.body;
  if (!resetCode || !password)
    return res.status(400).json({ message: "otp and password required" });

  const findOTPmatchUser = await User.findOne({ resetCode }).exec();

  if (!findOTPmatchUser)
    return res.status(400).json({ message: "no OTP matched" });

  const hashPassword = await bcrypt.hash(password, 10);

  findOTPmatchUser.password = hashPassword;

  await findOTPmatchUser.save();
  res.json({ message: "Password reset success" });
};

module.exports = { otpVerification, passwordReset };
