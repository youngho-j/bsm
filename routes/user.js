const router = require("express").Router();
const conn = require("../database/mysql.js");

// indexjs에서 user 경로로 들어올 경우 해당 js 파일로 전달됨

// 얘는 그럼 ~/user/myPage 나머지도 방식은 같다.
router.get("/myPage", (req, res) => {
    res.render("myPage");
});

router.get("/signin", (req, res) => {
    res.render("signin")
});

router.post("/signin", (req, res) => {
    res.sender("로그인 - 이후 필요정보 세션에 추가");
});

router.get("/signup", (req, res) => {
    res.render("signup")
});

router.post("/signup", (req, res) => {
    res.sender("회원가입");
});

router.get("/logout", (req, res) => {
    res.sender("로그 아웃 - 지갑 연동 해제");
});

// 해당 라우터 설정을 모듈로 빼주겠다.
module.exports = router;