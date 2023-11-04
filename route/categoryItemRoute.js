const express = require("express");
const Item = require("../model/Item");
const router = express.Router();

// GET items by category
router.get("/:category", async (req, res) => {
  const category = req.params.category;

  try {
    const items = await Item.find({ category });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
