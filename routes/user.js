const router = require("express").Router();
const conn = require("../database/mysql.js");
// env 파일을 읽기 위한 선언
require("dotenv").config();

// Klaytn API Service 설정
const CaverExtKAS = require("caver-js-ext-kas");
const caver = new CaverExtKAS();
// Klaytn API Service 초기화
caver.initKASAPI(process.env.chainId, process.env.accesskey, process.env.secretkey);

// 지갑 klaytn address 생성
router.get("/getWalletAddress", (req, res) => {
    // kas를 통해 지갑 주소 json 형식으로 생성
    account = async() => {
        res.json(await caver.kas.wallet.createAccount());
    }
    account();
});

// 회원 가입 페이지 이동 
router.get("/signup", (req, res) => {
    res.render("signup")
});

// 회원 가입 진행 
router.post("/signup", (req, res) => {
    let email = req.body._email;
    let pass = req.body._pass;
    let address = req.body._address;

    conn.query(
        `select * from user where email = ?`,
        [email],
        (err, result) => {
            //select문 조회시 에러
            if(err) {
                console.log(err);
                res.send("SQL select Error");
            } else {
                // 조회시 값이 없는 경우 => 사용 가능한 이메일
                if(result.length == 0) {
                    conn.query(
                        `insert into user values (?, ?, ?)`,
                        [email, pass, address],
                        (err) => {
                            if(err) {
                                console.log(err);
                                res.send("SQL insert Error");
                            } else {
                                res.redirect('/user/signin');
                            }
                        } 
                    )
                } else {
                    // 해당 값이 존재할 경우 메세지
                    res.send("이메일이 존재합니다.")
                }
            }
        }
    )
});

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

router.get("/logout", (req, res) => {
    res.sender("로그 아웃 - 지갑 연동 해제");
});

// 해당 라우터 설정을 모듈로 빼주겠다.
module.exports = router;