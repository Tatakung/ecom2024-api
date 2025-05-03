const express = require("express");
const { create, list, remove, listcopy } = require("../controllers/category");
const { authCheck, adminCheck } = require("../middlewares/authCheck");
const router = express.Router();

router.post("/category",authCheck,adminCheck, create);
router.get("/category", list);
router.get("/categorycopy", listcopy);
router.delete("/category/:id",authCheck,adminCheck, remove);

module.exports = router;
