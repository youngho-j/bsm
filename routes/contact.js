const router = require("express").Router();
const conn = require("../database/mysql.js");

// indexjs에서 user 경로로 들어올 경우 해당 js 파일로 전달됨

// 얘는 그럼 ~/contact/ 나머지도 방식은 같다.
router.get("/", (req, res) => {
    res.render("contactus");
});

// 해당 라우터 설정을 모듈로 빼주겠다.
module.exports = router;