const router = require('express').Router();
const conn = require('../database/mysql.js');
const moment = require('moment');
const fetch = require('cross-fetch');
const fs = require('fs');
const caverjs = require("caver-js");
const klaytn = require('../database/klaytn.js');
const contractEnv = require("../contract.json");
require("dotenv").config();

// caverjs를 이용하여 klaytn test net 접속을 위한 경로 설정
const testConn = new caverjs("https://api.baobab.klaytn.net:8651");

// 컨트랙 실행을 위한 abi 및 CA 등록 
const smartContract = new testConn.klay.Contract(contractEnv.abi, contractEnv.ca);

// 지갑 주소, 프라이빗 키 등록
const account = testConn.klay.accounts.createWithAccountKey(process.env.mainWA, process.env.mainPK);
testConn.klay.accounts.wallet.add(account);

// indexjs에서 nft 경로로 들어올 경우 해당 js 파일로 전달됨

// nft 민팅 정보 설정 페이지로 이동
router.get('/mint', (req, res) => {
    res.render('mintForm');
});

// nft 판매 가격 설정 페이지 이동
router.get('/setPrice', (req, res) => {
    res.render('priceForm');
});

// nft 구매 페이지 이동
router.get('/buy', (req, res) => {
    res.sender('nft 곡 구매 페이지 - modal');
});

// nft 목록 페이지 출력 - 전체 / 판매 목록 / 개인 목록
router.get('/list', (req, res) => {
    conn.query(
        `select * from nft`,
        (err, result) => {
            if(err) {
                console.log('SQL select Error!');
            } else {
                res.render('list', {
                    'data' : result
                });
            }
        }
    )
});

// nft 민팅 정보 설정값 DB 저장
router.post('/mint', (req, res) => {
    // 추후 민팅하려고 하는 사용자의 Address 받아야함 
    let title = req.body._title;
    let artist = req.body._artist;
    let genre = req.body._genre;
    let amount = req.body._amount;
    let fee = req.body._fee;
    let imgUrl = req.body._imgUrl;
    let musicUrl = req.body._musicUrl;

    // 메타 데이터 구성 
    const metadata = {
        name: `${title}`,
        description: 'This music was released by BSM',
        image: `${imgUrl}`,
        music: `${musicUrl}`,
        attributes: [{'trait_type': 'Artist', 'value': `${artist}`}, {'trait_type': 'Genre', 'value': `${genre}`}, {'trait_type': 'Amount', 'value': `${amount}`}, {'trait_type': 'Fee', 'value': `${fee}`}]
    }
    
    // 메타 데이터 JSON 화
    const metadataJSON = JSON.stringify(metadata);
    
     // 간단하게 해쉬값 출력
     const hash = (Math.random()).toString(32).split('.').pop();

    // JSON 저장 경로
    const aws = process.env.awsBucketUrl;
    const dataUrl = `${aws}/${hash}_${title}.json`;
    
    // cross-fetch 사용 
    fetch(dataUrl, {
        method : "PUT",
        headers : {
            "Content-Type" : "application/json",
        },
        body : metadataJSON
    })
    .catch((err) => console.log("원격 호출 에러 : " + err))
    .then(() => {
        console.log("업로드 완료!");
        // conn.query(
        //     `insert into nft(title, artist, genre, amount, fee, imgUrl, musicUrl) values(?,?,?,?,?,?,?)`,
        //     [title, artist, genre, amount, fee, imgUrl, musicUrl],
        //     (err) => {
        //         if(err) {
        //             console.log(err);
        //         } else {
        //             res.redirect("/");
        //         }
        //     }
        // )
        // 현재 NFT 이름이 배포시 적용했던 이름과 심볼로 들어감
        // 추후 민팅하는 사람의 Address로 변경해야함
        smartContract.methods.mintWithTokenURI(
            "0x870b53fac31b735cb1f95D49e3E790144F2A6b78", amount, dataUrl)
        .send(
            {
                from : account.address,
                gas : 100000000
            }
        )
        .then(result => {
            console.log("민팅 완료!");
        })
        .catch(error => console.log("민팅 에러", error))
    })
    // alert창을 띄워주기 고민해볼 것
    res.redirect("/");
});

// nft 판매 정보 등록 - 파일 값 제외하고 DB 저장 여부 확인
router.get('/sell', (req, res) => {
    res.render('priceForm');
});

// nft 전송
router.get('/transfer', (req, res) => {
    res.sender('nft 곡 전송 페이지 - modal / 에어드랍');
});

// 해당 라우터 설정을 모듈로 빼주겠다.
module.exports = router;