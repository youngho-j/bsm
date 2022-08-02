const router = require("express").Router();
const conn = require("../database/mysql.js");
const moment = require("moment");

// indexjs에서 nft 경로로 들어올 경우 해당 js 파일로 전달됨

// nft 민팅 정보 설정 페이지로 이동
router.get("/mint", (req, res) => {
    res.render("mintForm");
});
// nft 판매 가격 설정 페이지 이동
router.get("/setPrice", (req, res) => {
    res.render("priceForm");
});

// nft 구매 페이지 이동
router.get("/buy", (req, res) => {
    res.sender("nft 곡 구매 페이지 - modal");
});

// nft 목록 페이지 이동
router.get("/list", (req, res) => {
    res.render("list");
});

// nft 민팅 정보 설정값 DB 저장
router.post("/mint", (req, res) => {
    
    let title = req.body.title;
    let artist = req.body.artist;
    let gene = req.body.gene;
    let amount = req.body.amount;
    let fee = req.body.fee;
    let imgUrl = req.body.imgUrl;
    let musicUrl = req.body.musicUrl;

    conn.query(
        `insert into nft(title, artist, gene, amount, fee, imgUrl, musicUrl) values(?,?,?,?,?,?,?)`,
        [title, artist, gene, amount, fee, imgUrl, musicUrl],
        (err) => {
            if(err) {
                console.log(err);
            } else {
                res.redirect("/");
            }
        }
    )
});

// nft 판매 정보 등록 - 파일 값 제외하고 DB 저장 여부 확인
router.get("/sell", (req, res) => {
    res.render("priceForm");
});

// nft 전송
router.get("/transfer", (req, res) => {
    res.sender("nft 곡 전송 페이지 - modal / 에어드랍");
});

// nft 목록 출력 - 전체 / 판매 목록 / 개인 목록 
router.get("/list", (req, res) => {
    res.sender("nft 전체 목록(각 데이터 포함) / 주소를 통해 목록을 가져올 수 도 있어여함");
});

// 해당 라우터 설정을 모듈로 빼주겠다.
module.exports = router;