const express = require("express");
const router = express.Router();
const itemController = require("../controller/itemController");
const upload = require("../middleware/multer");

router.get("/", itemController.getItems);
router.get("/:id", itemController.getItem); // for single item
router.get("/search/:key", itemController.searchItem); // for search item
// router.get("/:category", itemController.getCategoryItems);

router.post("/", upload.array("images", 4), itemController.addItem);
router.put("/", upload.array("images", 4), itemController.editItem);
router.patch("/", itemController.patchItem);
router.delete("/", itemController.deleteItem);

module.exports = router;
