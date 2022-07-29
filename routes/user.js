const router = require("express").Router();
const conn = require("../database/mysql.js");

router.get("/myPage", (req, res) => {
    res.render("myPage");
});

module.exports = router;