const router = require("express").Router();
// DB 정보 
const conn = require("../database/mysql.js");
// KAS api 정보 
const klaytn = require("../database/klaytn.js");
// fetch 사용을 위한 선언
const fetch = require('cross-fetch');
// 회원 가입, 로그인 시 비밀번호 암호화 
const Crypto = require("crypto");
// 이거 수정 필요 - caver를 굳이 쓸 필요가 없을 듯
const connManager = require("../link/connManager.js");
// 세션 사용을 위한 선언 
const session = require("express-session");
// 배포한 컨트랙 변수 사용을 위한 선언
const contractEnv = require("../contractLast.json");

// env 파일을 읽기 위한 선언
require("dotenv").config();

// 컨트랙 정보 주입
const smartContract = connManager.smartContract;

// indexjs에서 user 경로로 들어올 경우 해당 js 파일로 전달됨

// 지갑 klaytn address 생성
// 회원 가입시 계정 생성 버튼 클릭시 실행하는 함수
router.get("/getWalletAddress", (req, res) => {
    // kas를 통해 지갑 주소 json 형식으로 생성, exception try catch 형식으로 변경 
    const account = async() => {
        try {
            const result = await klaytn.kasApi.kas.wallet.createAccount();
            // console.log("클레이튼 address 생성 결과값 :", result); // 체크 완료
            return res.json(result);
        } catch(e) {
            console.log("클레이튼 address 생성 에러 : ", e);
        }
    }
    account();
});

// 회원 가입 페이지 이동 
router.get("/signup", (req, res) => {
    res.render("signup",
        {
            "eoa" : "empty"
        }
    );
});

// 회원 가입 진행 
router.post("/signup", (req, res) => {
    let email = req.body._email;
    let pass = req.body._pass;
    let address = req.body._address;
    let pubkey = req.body._public;
    
    // 암호화
    const crypto = Crypto.createHmac('sha256', process.env.cryptoSecretkey).update(pass).digest('hex');

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
                        `insert into user(email, password, address, publicKey) values (?, ?, ?, ?)`,
                        [email, crypto, address, pubkey],
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

// 로그인 페이지로 이동
router.get("/signin", (req, res) => {
    res.render("signin", 
        {
            "eoa" : "empty"
        }
    );
});

// 로그인 정보 확인 후 로그인
router.post("/signin", (req, res) => {
    const id = req.body._email;
    const pass = req.body._pass;

    const crypto = Crypto.createHmac('sha256', process.env.cryptoSecretkey).update(pass).digest('hex');

    conn.query(
        `select email, address from user where email = ? and password = ?`,
        [id, crypto], 
        (err, result) => {
            if(err){
                console.log(err);
                res.send("SQL select error");
            }else{
                if(result.length > 0) {    
                    req.session.login = result[0];
                    res.redirect("/");
                }else{
                    res.redirect("/user/signin");
                }
            }
        }
    )
});

// 로그아웃
router.get("/signout", (req, res) => {
    if(req.session.login) {
        req.session.destroy(
            function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("로그아웃 확인");
                    res.redirect("/user/signin");
                }
            }
        )
    }
});

// 해당 계정의 존재하는 모든 NFT JSON 배열 값
let mylistData = [];
// 해당 계정의 존재하는 모든 NFT 음악리스트 값
let musiclist = [];
// tokenUri에 저장되어 있는 메타데이터 
let metaData = "";
let tokenIdList = [];
let tokenUriList = [];
let countTokenId = [];
let equalValue = "";

// 마이페이지 
router.get("/myPage", (req, res, next) => {
    if(!req.session.login) {
        res.redirect("/");
    } else {
        const ownerAddress = req.session.login.address;
        console.log("로그인한 사용자의 EOA Address : ", ownerAddress);
        // console.log(result2.items[0].extras); // 토큰 id 및 토큰 uri 가지고 있는 거 확인
        const getMyList = async () => {
            try{ 
                // 해당 EOA가 가지고 있는 NFT 모두 조회 
                const result = await klaytn.kasApi.kas.tokenHistory.getNFTListByOwner(contractEnv.ca, ownerAddress); 
                // console.log("EOA에서 소유한 NFT들 :", result); // tokenId 및 tokenUri 가지고 있는 거 확인
                for(let i = 0 ; i < result.items.length ; i++) {
                    // NFT의 정보 중 TokenUri가 다를 경우 
                    if(equalValue != result.items[i].tokenUri) {
                        equalValue = result.items[i].tokenUri;
                        tokenUriList.push(equalValue);
                        if(countTokenId.length != 0) {
                            tokenIdList.push(countTokenId);
                            countTokenId = [];
                        }
                        countTokenId.push(result.items[i].tokenId);
                    } else {
                        // tokenUri가 같을 경우
                        countTokenId.push(result.items[i].tokenId);
                        // 마지막 정보인경우 
                        if(i == result.items.length-1) {
                            tokenIdList.push(countTokenId);
                            countTokenId = [];
                        }
                    }
                }
                console.log("토큰 uri 정보 :", tokenUriList);
                console.log("토큰 id 정보 :", tokenIdList);
                next();
            } catch(e) {
                console.log("마이페이지 로딩 에러", e);
            } 
        }
        getMyList();
    }
});
// router.get("/myPage", (req, res, next) => {
//     if(!req.session.login) {
//         res.redirect("/");
//     } else {
//         const ownerAddress = req.session.login.address;
//         console.log("로그인한 사용자의 EOA Address : ", ownerAddress);
//         // NFT 모두 조회를 위한 옵션, size는 생략시 기본 100 / 최대 1000
//         const queryOptions = {kind : klaytn.kasApi.kas.tokenHistory.queryOptions.kind.nft};
//         // 해당 EOA가 가지고 있는 NFT 모두 조회 
//         // const result2 = await klaytn.kasApi.kas.tokenHistory.getTokenListByOwner("0x1d57fc42f6b9ad5102e31874f26b9e34d4331611", queryOptions);
//         // console.log(result2.items[0].extras); // 토큰 id 및 토큰 uri 가지고 있는 거 확인
//         let getMyList = async () => {
            
//             try{ 
//                 let result = await smartContract.methods.updateMyNftList(ownerAddress)
//                 .call()
//                 .catch((err) => {
//                     console.log(err);
//                     return next();
//                 });
//                 console.log("컨트랙 결과1 : ", result.length);
//                 console.log("컨트랙 결과2 : ", result[1].ownedNumberOfNft);
//                 for(let i = 1 ; i < result.length; i++) {
//                     if(result[i].ownedNumberOfNft != '0') {
//                         metaData = {
//                             TokenURI: result[i].TokenURI,
//                             ownedNumberOfNft: result[i].ownedNumberOfNft
//                         }
//                         console.log("json 형식 데이터 출력 확인 : ", metaData);
//                         let data = await fetch(result[i].TokenURI)
//                             .then(res => res.json())
//                             .catch(err => console.log(err));
//                         console.log(data);
        
//                         Object.assign(data, metaData);
//                         mylistData.push(data);
//                         musiclist.push(data.music);
//                     }
//                 }
//                 // console.log("합친 데이터 출력 확인 : ", mylistData);
//                 // console.log("음악 데이터 출력 확인 : ", musiclist);
//             } catch(error) {
//                 console.log(error);
//             } finally {
//                 return next();
//             }
//         }
//         getMyList();
//     }
// });

// next()로 인해서 호출이 됨
router.get("/myPage", (req, res, next) => {
    // console.log(`출력 : ${JSON.stringify(mylistData)}`);
    // console.log(`출력22 : ${mylistData}`);
    const data = mylistData;
    const mList = musiclist;
    // push를 통해 계속 누적이 되므로 변수에 저장후 초기화
    mylistData = [];
    musiclist = [];
    console.log("마이페이지 현재 address : ", req.session.login.address);
    if(data.length > 0 ) {
        res.render("myPage", {
            "eoa" : req.session.login.address,
            "data" : data, 
            "mList" : mList
        });
    } else {
        res.render("myPage", {
            "eoa" : req.session.login.address,
            "data" : "empty" 
        });
    }
});

// 해당 라우터 설정을 모듈로 빼주겠다.
module.exports = router;