const express = require("express");
const router = express.Router();
const restPasswordController = require("../controller/resetPasswordController");

// const verifyJWT = require("../middleware/verifyJWT");
// router.use(verifyJWT);

router
  .route("/")
  .put(restPasswordController.otpVerification)
  .patch(restPasswordController.passwordReset);

module.exports = router;
