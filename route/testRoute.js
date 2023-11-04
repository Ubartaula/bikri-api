const express = require("express");
const router = express.Router();
const path = require("path");

router.route("/").get((req, res) => {
  res.send("hi");
});
router.route("/").post((req, res) => {
  console.log("BODY", req.body.form);
  console.log("file", req.file);
  res.send("done");
});

module.exports = router;
