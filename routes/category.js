const express = require("express");
const { create, list, remove } = require("../controllers/category");
const { authCheck, adminCheck } = require("../middlewares/authCheck");
const router = express.Router();

router.post("/category",authCheck,adminCheck, create);
router.get("/category", list);

router.get("/test-db", testdb);


router.delete("/category/:id",authCheck,adminCheck, remove);

module.exports = router;
