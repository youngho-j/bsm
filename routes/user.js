const router = require("express").Router();
const conn = require("../database/mysql.js");
const klaytn = require("../database/klaytn.js");
const fetch = require('cross-fetch');
const { json } = require("express");
// env 파일을 읽기 위한 선언
require("dotenv").config();

// 지갑 klaytn address 생성
router.get("/getWalletAddress", (req, res) => {
    // kas를 통해 지갑 주소 json 형식으로 생성
    account = async() => {
        res.json(await klaytn.kasApi.kas.wallet.createAccount());
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
// 해당 계정의 존재하는 모든 NFT JSON 값
let mylistData = "";
// 중복되는 tokenUri를 제거하기 위한 변수
let tokenUri = "";
// tokenUri에 저장되어 있는 메타데이터 
let metaData = "";
// 얘는 그럼 ~/user/myPage 나머지도 방식은 같다.
router.get("/myPage", (req, res, next) => {
    // const contractAddress = "0x62530539bf64088e62aadbecd67fdb09ba157796";
    // const tokenId = "0";
    const contractAddress = "0x62530539bf64088e62aadbecd67fdb09ba157796";
    const ownerAddress = "0x870b53fac31b735cb1f95D49e3E790144F2A6b78";
    // EOA 계정 NFT 리스트 통합하기 
    const getMyList = async () => {
        try {
            // let result = await caver.kas.tokenHistory.getNFT(contractAddress, tokenId);
            const result = await caver.kas.tokenHistory.getNFTListByOwner(contractAddress, ownerAddress);
            for(let i = 0 ; i < result.items.length ; i++){
                if(tokenUri != result.items[i].tokenUri) {
                    tokenUri = result.items[i].tokenUri;
                    fetch(tokenUri)
                        .then(response => response.json())
                        .then(jsondata => metaData = jsondata)
                        .catch(err => console.log("fetch error", err))
                }
                Object.assign(result.items[i], metaData);
            }
            mylistData = result;
            // console.log(result.tokenUri);
            // fetch(result.tokenUri)
            //     .then(response => response.json())
            //     .then(jsondata => {
            //         console.log(jsondata)
            //         mylistData = jsondata;
            //     })
            //     .catch(err => console.log("fetch error", err))
        } catch (error) {
            console.log("에러", error);
        }
    }

    getMyList();
    next();
    
    // 최근 
    // const contractAddress = "0x62530539bf64088e62aadbecd67fdb09ba157796";
    // const ownerAddress = "0x870b53fac31b735cb1f95D49e3E790144F2A6b78";
    // const getMyList = async () => {
    //     try {
    //         const result = await caver.kas.tokenHistory.getNFTListByOwner(
    //             contractAddress,
    //             ownerAddress,
    //         );
    //         console.log("결과", result)
    //     } catch (error) {
    //         console.log(error);
    //     }

    // }
    // getMyList();
    // res.render("myPage");
});

// next()로 인해서 호출이 됨
router.get("/myPage", (req, res, next) => {

    console.log(`출력 : ${JSON.stringify(mylistData)}`);
    console.log(`출력22 : ${mylistData}`);
    res.render("myPage", {"data" : mylistData});
})

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