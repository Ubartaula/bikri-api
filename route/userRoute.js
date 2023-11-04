const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

// const verifyJWT = require("../middleware/verifyJWT");
// router.use(verifyJWT);

router
  .route("/")
  .get(userController.getUsers)
  .post(userController.addUser)
  .put(userController.editUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);

module.exports = router;
