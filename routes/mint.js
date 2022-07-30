const router = require("express").Router();
const conn = require("../database/mysql.js");
const moment = require("moment");

// nft 생성 후 판매 가격 설정
router.get("/mint", (req, res) => {
    res.render("mintForm");
});

router.get("/setPrice", (req, res) => {
    res.render("priceForm");
});

// nft 구매
router.get("/buy", (req, res) => {
    res.sender("nft 곡 구매 페이지 - modal");
});

// nft 판매
router.get("/sell", (req, res) => {
    res.sender("nft 곡 판매 페이지 - modal");
});

// nft 전송
router.get("/transfer", (req, res) => {
    res.sender("nft 곡 전송 페이지 - modal / 에어드랍");
});

// nft 목록 출력 - 전체 / 판매 목록 / 개인 목록 
router.get("/list", (req, res) => {
    res.sender("nft 전체 목록(각 데이터 포함) / 주소를 통해 목록을 가져올 수 도 있어여함");
});


module.exports = router;