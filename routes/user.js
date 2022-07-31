const router = require("express").Router();
const conn = require("../database/mysql.js");

router.get("/myPage", (req, res) => {
    res.render("myPage");
});

router.get("/login", (req, res) => {
    res.render("login")
});

router.post("/login", (req, res) => {
    res.sender("로그인 - 이후 필요정보 세션에 추가");
});

router.get("/logout", (req, res) => {
    res.sender("로그 아웃 - 지갑 연동 해제");
});

module.exports = router;