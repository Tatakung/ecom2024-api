const express = require("express");
const {
  create,
  list,
  remove,
  listby,
  searchFilters,
  update,
  read,
  createi,
  removeImages
} = require("../controllers/product");
const { authCheck, adminCheck } = require("../middlewares/authCheck");

const router = express.Router();

router.post("/product", create);
router.get("/products/:count", list);
router.get("/product/:id", read);
router.delete("/product/:id", remove);
router.put("/product/:id", update);
router.post("/productby", listby);
router.post("/search/filters", searchFilters);

router.post("/images",authCheck,adminCheck,createi)
router.post("/removeimages",authCheck,adminCheck,removeImages)

module.exports = router;
