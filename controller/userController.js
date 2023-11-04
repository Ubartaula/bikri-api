const User = require("../model/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_USER,
    pass: process.env.AUTH_PASS,
  },
});

const getUsers = async (req, res) => {
  const users = await User.find().select("-password").lean().exec();
  if (!users?.length) return res.json({ message: "no user data available" });
  res.json(users);
};

const addUser = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password, lat, lng, role } =
    req.body;

  if (!firstName || !lastName || !email || !password) {
    return res
      .status(400)
      .json({ message: "You need to complete form fill up" });
  }

  // check email validity
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailCheck = emailRegex.test(email);
  if (!emailCheck) {
    return res
      .status(400)
      .json({ message: `The ${email} you have provided is not a valid email` });
  }
  // end of check email validity

  const checkUserWithEmail = await User.findOne({ email }).lean().exec();
  if (checkUserWithEmail)
    return res.status(400).json({ message: "This email is already in use" });

  if (phoneNumber) {
    const checkUserPhoneNumber = await User.findOne({ phoneNumber })
      .lean()
      .exec();
    if (checkUserPhoneNumber)
      return res
        .status(400)
        .json({ message: "This phone number is already in use" });
  }

  if (password?.length < 4)
    return res
      .status(400)
      .json({ message: "password should have 4 or more character" });

  const hashPassword = await bcrypt.hash(password, 10);

  const newUserObj =
    email || phoneNumber || lat || lng || role || firstName || lastName
      ? {
          firstName,
          lastName,
          email,
          phoneNumber,
          password: hashPassword,
          lat,
          lng,
          role,
        }
      : {
          firstName,
          lastName,
          email,
          //  phoneNumber,
          password: hashPassword,
          lng,
          lat,
        };

  const mailOptions = {
    from: process.env.AUTH_USER, // sender address
    to: email, // list of receivers
    subject: "Welcome to https://www.bikri.com", // Subject line
    text: `Hello Mr. ${lastName} ${firstName}, Visit https://www.bikri.com for more details.`, // plain text body
    // html: "<b>Hello world?</b>", // html body
  };

  try {
    await transporter.sendMail(mailOptions);
    await User.create(newUserObj);
    res.json({ message: `${firstName} with email ${email} is created.` });
  } catch (error) {
    res.status(400).json({ message: "Could not create new user object" });
    console.log(error);
  }
};

const editUser = async (req, res) => {
  const {
    id,
    password,
    firstName,
    lastName,
    email,
    phoneNumber,
    lat,
    lng,
    role,
    isActive,
  } = req.body;

  if (!id) return res.json({ message: "id require to edit user" });
  // check email validity
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailCheck = emailRegex.test(email);
    if (!emailCheck) {
      return res.status(400).json({
        message: `The ${email} you have provided is not a valid email`,
      });
    }
  }
  // end of check email validity

  const findUserToEdit = await User.findById(id).exec();
  if (!findUserToEdit)
    return res.json({ message: "no such user found to edit" });

  if (email) {
    const findDupEmail = await User.findOne({ email }).lean().exec();
    if (findDupEmail && !(findDupEmail._id?.toString() === id))
      return res.status(409).json({ message: "This email is already in use" });
  }

  if (phoneNumber) {
    const findDupPhoneNumber = await User.findOne({ phoneNumber })
      .lean()
      .exec();
    if (findDupPhoneNumber && !(findDupPhoneNumber._id?.toString() === id))
      return res
        .status(409)
        .json({ message: "This phone number is already in use" });
  }

  if (password) {
    if (password?.length < 4) {
      return res
        .status(400)
        .json({ message: "Password length should be at least 4 character" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    findUserToEdit.password = hashPassword;
  }

  if (email) {
    findUserToEdit.email = email;
  }
  if (role) {
    findUserToEdit.role = role;
  }
  if (phoneNumber) {
    findUserToEdit.phoneNumber = phoneNumber;
  }

  if (lat) {
    findUserToEdit.lat = lat;
  }

  if (lng) {
    findUserToEdit.lng = lng;
  }
  if (isActive) {
    findUserToEdit.isActive = isActive;
  }

  if (firstName) {
    findUserToEdit.firstName = firstName;
  }
  if (lastName) {
    findUserToEdit.lastName = lastName;
  }

  await findUserToEdit.save();
  res.json({ message: "a user is edited" });
};

const patchUser = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: "email require to reset password" });

  const findUser = await User.findOne({ email }).exec();
  if (!findUser)
    return res
      .status(401)
      .json({ message: "We cannot find an account with that email" });

  if (!findUser.isActive)
    return res.status(401).json({
      message: "your account is deactivated, please contact customer care",
    });

  const otp = Math.floor(Math.random() * 100000);

  const mailOption = {
    from: process.env.AUTH_USER,
    to: findUser?.email,
    sub: "opt code",
    text: `This is your one time password reset code [ ${otp} ] and it will expire in 5 minutes.`,
  };
  if (findUser) {
    // just to send email one time
    transporter.sendMail(mailOption, (err) => {
      if (err) console.log(err);
    });
    findUser.resetCode = otp;
    findUser.resetTime = Date.now() + 5 * 60 * 1000;
  }

  await findUser.save();

  res.json({ message: "email verification success and opt has sent to email" });
};

const deleteUser = async (req, res) => {
  const { id } = req.body;
  if (!id)
    return res.status(400).json({ message: " id require to delete a user" });

  const findUserToDelete = await User.findById(id).exec();
  if (!findUserToDelete)
    return res.status(400).json({ message: " no such user found to delete" });

  await findUserToDelete.deleteOne();
  res.json({ message: "a user is deleted" });
};

module.exports = { getUsers, addUser, editUser, deleteUser, patchUser };
