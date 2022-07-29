const router = require("express").Router();
const conn = require("../database/mysql.js");
const moment = require("moment");

router.get("/mint", (req, res) => {
    res.render("mintForm");
});

router.get("/setPrice", (req, res) => {
    res.render("priceForm");
});

module.exports = router;