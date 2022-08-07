const router = require("express").Router();
const conn = require("../database/mysql.js");
const klaytn = require("../database/klaytn.js");
const fetch = require('cross-fetch');
const Crypto = require("crypto");
const caverjs = require("caver-js");
const contractEnv = require("../contract.json");
// env 파일을 읽기 위한 선언
require("dotenv").config();

// caverjs를 이용하여 klaytn test net 접속을 위한 경로 설정
const testConn = new caverjs("https://api.baobab.klaytn.net:8651");

// 컨트랙 실행을 위한 abi 및 CA 등록 
const smartContract = new testConn.klay.Contract(contractEnv.abi, contractEnv.ca);

// 지갑 주소, 프라이빗 키 등록
const account = testConn.klay.accounts.createWithAccountKey(process.env.mainWA, process.env.mainPK);
testConn.klay.accounts.wallet.add(account);

// indexjs에서 user 경로로 들어올 경우 해당 js 파일로 전달됨

// 지갑 klaytn address 생성
router.get("/getWalletAddress", (req, res) => {
    // kas를 통해 지갑 주소 json 형식으로 생성
    account = async() => {
        res.json(await klaytn.kasApi.kas.wallet.createAccount());
    }
    account()
    .catch((error) => console.log("에러 : ", error));
});

// 회원 가입 페이지 이동 
router.get("/signup", (req, res) => {
    res.render("signup");
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
    res.render("signin");
});

// 로그인 정보 확인 후 로그인
router.post("/signin", (req, res) => {
    const id = req.body._email;
    const pass = req.body._pass;

    const crypto = Crypto.createHmac('sha256', process.env.cryptoSecretkey).update(pass).digest('hex');

    conn.query(
        `select * from user where email = ? and password = ?`,
        [id, crypto], 
        (err, result) => {
            if(err){
                console.log(err);
                res.send("SQL select error");
            }else{
                if(result.length > 0) {    
                    // req.session.login = result[0]
                    res.redirect("/");
                }else{
                    res.redirect("/user/signin");
                }
            }
        }
    )
});

router.get("/logout", (req, res) => {
    // if(req.session.login) {
    //     req.session.destroy(
    //         function(err) {
    //             if(err) {
    //                 console.log(err);
    //             } else {
    //                 res.redirect("/signin");
    //             }
    //         }
    //     )
    // }
    // 세션은 나중에 적용하기 로그아웃시 메인으로 이동
    res.redirect("/");
});

// 이전 마이페이지 코드
// // 해당 계정의 존재하는 모든 NFT JSON 값
// let mylistData = "";
// // 중복되는 tokenUri를 제거하기 위한 변수
// let tokenUri = "";
// // tokenUri에 저장되어 있는 메타데이터 
// let metaData = "";
// // 얘는 그럼 ~/user/myPage 나머지도 방식은 같다.
// router.get("/myPage", (req, res, next) => {
//     const contractAddress = "0x62530539bf64088e62aadbecd67fdb09ba157796";
//     const ownerAddress = "0x870b53fac31b735cb1f95D49e3E790144F2A6b78";
    
//     // EOA 계정 내 NFT 정보를 담은 json 리스트 합치기 
//     const getMyList = async () => {
//         try {
//             const result = await caver.kas.tokenHistory.getNFTListByOwner(contractAddress, ownerAddress);
//             for(let i = 0 ; i < result.items.length ; i++){
//                 if(tokenUri != result.items[i].tokenUri) {
//                     tokenUri = result.items[i].tokenUri;
//                     fetch(tokenUri)
//                         .then(response => response.json())
//                         .then(jsondata => metaData = jsondata)
//                         .catch(err => console.log("fetch error", err))
//                 }
//                 Object.assign(result.items[i], metaData);
//             }
//             mylistData = result;
//         } catch (error) {
//             console.log("에러", error);
//         }
//     }

//     getMyList();
//     next();
    
// });

// // next()로 인해서 호출이 됨
// router.get("/myPage", (req, res, next) => {
//     // console.log(`출력 : ${JSON.stringify(mylistData)}`);
//     // console.log(`출력22 : ${mylistData}`);
//     res.render("myPage", {"data" : mylistData});
// });

// 해당 계정의 존재하는 모든 NFT JSON 배열 값
let mylistData = [];
// 해당 계정의 존재하는 모든 NFT 음악리스트 값
let musiclist = [];
// 중복되는 tokenUri를 제거하기 위한 변수
let data = "";
// tokenUri에 저장되어 있는 메타데이터 
let metaData = "";
// 얘는 그럼 ~/user/myPage 나머지도 방식은 같다.
router.get("/myPage", (req, res, next) => {
    // 나중에 session에 있는 값을 가져오기 
    const ownerAddress = "0x870b53fac31b735cb1f95D49e3E790144F2A6b78";
    
    const getMyList = async () => {
        try {
            await smartContract.methods.updateMyNftList(ownerAddress)
            .call()
            .then((result) => data = result);
            // console.log("전체 데이터 출력 확인 : ", data);

            for(let i = 0 ; i < data.length ; i++) {
                metaData = {
                    TokenURI: `${data[i].TokenURI}`,
                    ownedNumberOfNft: `${data[i].ownedNumberOfNft}`
                }
                // console.log("json 형식 데이터 출력 확인 : ", metaData);
                fetch(`${data[i].TokenURI}`)
                .then(res => res.json())
                .then((jsonData) => {
                    // console.log("패치 출력 확인 1 : ", jsondata);
                    // 패치를 통해 출력한 데이터 합치기
                    Object.assign(jsonData, metaData);
                    mylistData.push(jsonData);
                    musiclist.push(`${jsonData.music}`);
                })
                .catch(err => console.log("fetch error", err))
                
            }
            // console.log("합친 데이터 출력 확인 : ", mylistData);
        } catch (error) {
            console.log("에러", error);
        }
    }
    getMyList();
    next();
});

// next()로 인해서 호출이 됨
router.get("/myPage", (req, res, next) => {
    // console.log(`출력 : ${JSON.stringify(mylistData)}`);
    // console.log(`출력22 : ${mylistData}`);
    const data = mylistData;
    const mList = musiclist;
    // push를 통해 계속 누적이 되므로 변수에 저장후 초기화
    mylistData = [];
    musiclist = [];
    res.render("myPage", {
        "data" : data, 
        "mList" : mList
    });
});
// 해당 라우터 설정을 모듈로 빼주겠다.
module.exports = router;