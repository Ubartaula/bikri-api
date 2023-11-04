const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  const { email, phoneNumber, password } = req.body;
  const emailORphoneCheck = email || phoneNumber ? true : false;

  if (emailORphoneCheck === false)
    return res.status(400).json({
      message: "email or phone number require along with password to logged in",
    });

  if (!password)
    return res.status(400).json({ message: "password field is empty" });

  let findUserToLogin = {};

  if (email) {
    findUserToLogin = await User.findOne({ email }).exec();
  }

  if (!email && phoneNumber) {
    findUserToLogin = await User.findOne({ phoneNumber }).exec();
  }

  if (!findUserToLogin)
    return res.status(401).json({
      message: `We cannot find an account with that ${
        email ? "email -" : "mobile no -"
      } ${email || phoneNumber}`,
    });

  if (findUserToLogin && !findUserToLogin?.isActive)
    return res.status(401).json({
      message: "Your account is deactivated , please contact customer care",
    });

  // verify password
  const verifyPassword = await bcrypt.compare(
    password,
    findUserToLogin?.password
  );

  if (!verifyPassword)
    return res.status(401).json({ message: "Your password did not match" });

  // creating accessToken
  const accessToken = jwt.sign(
    {
      UserInfo: {
        email: findUserToLogin?.email,
        phoneNumber: findUserToLogin?.phoneNumber,
        role: findUserToLogin?.role,
        userId: findUserToLogin?._id,
        lat: findUserToLogin?.lat,
        lng: findUserToLogin?.lng,
        firstName: findUserToLogin?.firstName,
        lastName: findUserToLogin?.lastName,
      },
    },
    process.env.AUTH_ACCESS_TOKEN,
    { expiresIn: "30m" }
  );

  // create refreshToken
  const refreshToken = jwt.sign(
    {
      UserInfo: {
        email: findUserToLogin?.email,
        phoneNumber: findUserToLogin?.phoneNumber,
        role: findUserToLogin?.role,
        userId: findUserToLogin?._id,
        lat: findUserToLogin?.lat,
        lng: findUserToLogin?.lng,
        firstName: findUserToLogin?.firstName,
        lastName: findUserToLogin?.lastName,
      },
    },

    process.env.AUTH_REFRESH_TOKEN,
    { expiresIn: "1h" }
  );

  //create cookie,
  res.cookie("jwt", refreshToken, {
    // httpOnly: true, //accessible only by web server
    // secure: true, //https
    // sameSite: "None", //cross-site cookie
    maxAge: 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  res.json({ accessToken });
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt)
    return res.status(401).json({ message: "Unauthorized , No Cookies" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.AUTH_REFRESH_TOKEN,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      let findUser;

      const findUserEm = await User.findOne({
        email: decoded.UserInfo?.email,
      }).exec();

      const findUserPh = await User.findOne({
        email: decoded.UserInfo?.phoneNumber,
      }).exec();

      findUser = findUserEm || findUserPh;

      if (!findUser) {
        return res
          .status(401)
          .json({ message: "Unauthorized, No such user found" });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            email: findUser?.email,
            phoneNumber: findUser?.phoneNumber,
            role: findUser?.role,
            userId: findUser?._id,
            lat: findUser?.lat,
            lng: findUser?.lng,
            firstName: findUser?.firstName,
            lastName: findUser?.lastName,
          },
        },
        process.env.AUTH_ACCESS_TOKEN,
        { expiresIn: "30m" }
      );

      res.json({ accessToken });
    }
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", {
    // httpOnly: true,
    // sameSite: "None",
    // secure: true,
  });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
};
