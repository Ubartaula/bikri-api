const { query } = require("express");
const cloudinary = require("../config/cloudinary");
const Item = require("../model/Item");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_USER,
    pass: process.env.AUTH_PASS,
  },
});
//populate("user", "-password")
const getItems = async (req, res) => {
  const items = await Item.find()
    .sort({ createdAt: -1 })
    .populate("user", "-password")
    .exec();
  if (!items?.length)
    return res.status(400).json({ message: "no item data available" });

  res.json(items);
};

const getItem = async (req, res) => {
  try {
    const product = await Item.findById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

const addItem = async (req, res) => {
  const {
    user,
    itemName,
    category,
    subCategory,
    subCategoryID,
    quantity,
    price,
    phoneNumber,
    email,
    province,
    district,
    city,
    itemInfo,
    text,
    lat,
    lng,
  } = req.body;

  if (
    !user ||
    !itemName ||
    !quantity ||
    !price ||
    !category ||
    !subCategory ||
    !subCategoryID
  )
    return res.status(400).json({
      message: "userId, itemName, qty, price, category are compulsory ",
    });

  const images = req.files;
  let imageURL = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.uploader.upload(images[i]?.path, {
      folder: `bikri_${itemName}_by_${email}`,
      use_filename: true,
      format: "webp",
      overwrite: true,
      transformation: {
        aspect_ratio: "1.0",
        gravity: "auto",
        width: 500,
        height: 500,
        crop: "fill",
      },
    });

    if (!result) {
      return res.status(500).json({ message: "image url could not generate" });
    }

    imageURL.push(result.secure_url);
  }

  const newItemObj =
    phoneNumber ||
    email ||
    images ||
    itemInfo ||
    text ||
    province ||
    district ||
    city
      ? {
          user,
          itemName,
          category,
          subCategory,
          subCategoryID,
          quantity,
          price,
          phoneNumber,
          email,
          province,
          district,
          city,
          images: imageURL,
          itemInfo,
          text,
          lat,
          lng,
        }
      : {
          user,
          itemName,
          category,
          subCategory,
          subCategoryID,
          quantity,
          price,
          text,
          lat,
          lng,
        };

  try {
    await Item.create(newItemObj);
    res.json({ message: "new item created" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "error while creating a new item object" });
  }
};

const searchItem = async (req, res) => {
  try {
    const result = await Item.aggregate([
      {
        $search: {
          index: "itemSearch",
          text: {
            query: req.params.key,
            path: {
              wildcard: "*",
            },
          },
        },
      },
    ]);

    if (!result?.length)
      return res.status(200).json({ message: "No search result found" });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

const getCategoryItems = async (req, res) => {
  const category = req.params.category;

  try {
    const items = await Item.find({ category });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const editItem = async (req, res) => {
  const {
    id,
    itemName,
    category,
    subCategory,
    quantity,
    price,
    phoneNumber,
    email,
    province,
    district,
    city,
    itemInfo,
    text,
  } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ message: "item id require to edit item umesh edited" });
  }

  //working for images

  const images = req.files;
  let imageURL = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.uploader.upload(images[i]?.path, {
      folder: "craigResized",
      use_filename: true,
      format: "webp",
      overwrite: true,
      transformation: {
        aspect_ratio: "1.0",
        gravity: "auto",
        width: 700,
        height: 700,
        crop: "fill",
      },
    });

    if (!result) {
      return res.status(500).json({ message: "image url could not generate" });
    }

    imageURL.push(result.secure_url);
  }

  //end of working for images

  const findItemToEdit = await Item.findById(id).exec();
  if (!findItemToEdit)
    return res.status(400).json({ message: "no such item found to edit" });

  if (itemName) {
    findItemToEdit.itemName = itemName;
  }
  if (category) {
    findItemToEdit.category = category;
  }
  if (subCategory) {
    findItemToEdit.subCategory = subCategory;
  }
  if (quantity) {
    findItemToEdit.quantity = quantity;
  }
  if (price) {
    findItemToEdit.price = price;
  }
  if (phoneNumber) {
    findItemToEdit.phoneNumber = phoneNumber;
  }
  if (email) {
    findItemToEdit.email = email;
  }
  if (province) {
    findItemToEdit.province = province;
  }
  if (district) {
    findItemToEdit.district = district;
  }
  if (city) {
    findItemToEdit.city = city;
  }
  if (images?.length > 0) {
    findItemToEdit.images = imageURL;
  }
  if (itemInfo) {
    findItemToEdit.itemInfo = itemInfo;
  }
  if (text) {
    findItemToEdit.text = text;
  }

  await findItemToEdit.save();
  res.json({ message: "item edited successfully" });
};

// patch for social reactions
const patchItem = async (req, res) => {};

const deleteItem = async (req, res) => {
  const { id } = req.body;
  if (!id)
    return res.status(400).json({ message: "id require to delete item" });

  const findItemToDelete = await Item.findById(id).exec();
  if (!findItemToDelete)
    return res.status(400).json({ message: "no such item found to delete" });

  await findItemToDelete.deleteOne();
  res.json({ message: "a item is deleted" });
};

module.exports = {
  getItems,
  addItem,
  editItem,
  patchItem,
  deleteItem,
  getItem,
  searchItem,
  getCategoryItems,
};
