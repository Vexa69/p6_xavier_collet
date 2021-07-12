const express = require("express");
const router = express.Router();
const isOwner = require("../middleware/isOwner");
const sauceCtrl = require("../controllers/sauces");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.get("/", auth, sauceCtrl.getAllSauces);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.post("/", auth, multer, sauceCtrl.createOneSauces);
router.put("/:id", auth, isOwner, multer, sauceCtrl.modifyOneSauces);
router.delete("/:id", auth, isOwner, sauceCtrl.deleteOneSauces);
router.post("/:id/like", auth, sauceCtrl.likeDislikeSauce);

module.exports = router;
