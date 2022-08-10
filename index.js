const express = require("express");
const session = require("express-session");
const app = express();
const port = process.env.PORT || 3000;
const connManager = require('./link/connManager.js');

// env 환경 설정 읽어오기 위한 설정 - 현재 얘는 쓰는 곳 없음
require("dotenv").config();

// 컨트랙 실행을 위한 abi 및 CA 등록 
const smartContract = connManager.smartContract;

// ejs 파일 읽어오기 위한 엔진 및 경로 설정
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// 정적 파일 경로 설정 - public 폴더 아래에 js, css, img 폴더들
app.use(express.static('public'));

// session 세팅
app.use(session(
    {
        httpOnly: true, 
        secret: process.env.sessionSecretkey,
        resave: false,
        saveUninitialized: true,
    }
));

// post 형식의 데이터를 읽어 오기 위한 설정
app.use(express.json());
app.use(express.urlencoded({
    extended:false
}));

// 아래 경로가 포함된 요청이 있을 경우 해당 js파일로 라우팅(전달) 됨
app.use("/nft", require("./routes/nft.js"));
app.use("/user", require("./routes/user.js"));
app.use("/contact", require("./routes/contact.js"));

// 해당 계정에 있는 NFT 데이터 
let mylistData = [];
// tokenUri에 저장되어 있는 메타데이터 
let metaData = "";

// 서버 로딩후 가장 처음 보여주는 페이지
app.get("/", (req, res, next) => {
    // 판매 등록된 NFT를 가지고 있는 계정 필요
    // 수정 필요 - 나중에 판매등록된 NFT들을 가지고 있는 계정으로  
    const ownerAddress = process.env.nftsWA;
    console.log("판매등록 EOA : ", ownerAddress);
    
    let getMyList = async () => {
        // 백틱 수정 필요 0810/0220
        try{ 
            let result = await smartContract.methods.updateMyNftList(ownerAddress)
            .call()
            .catch((err) => {
                console.log(err);
                return next();           
            });
            
            // console.log("판매등록 EOA 2: ", ownerAddress);
            // console.log(result);
            
            for(let i = 1 ; i < result.length ; i++) {
                if(mylistData.length == 4) {
                    break;
                }
                if(`${result[i].ownedNumberOfNft}` != 0) {
                    metaData = {
                        TokenURI: `${result[i].TokenURI}`,
                        ownedNumberOfNft: `${result[i].ownedNumberOfNft}`
                    }
                    // console.log("json 형식 데이터 출력 확인 : ", metaData);
                    let data = await fetch(`${result[i].TokenURI}`)
                        .then(res => res.json())
                        .catch(err => console.log(err));
                    // console.log(fetchData);
    
                    Object.assign(data, metaData);
                    mylistData.push(data);
                }
            }
            // console.log("합친 데이터 출력 확인 : ", mylistData);

        } catch(error) {
            console.log(error);
        } finally {
            return next();
        }
    }
    getMyList();
});

// next()로 인해서 호출이 됨
app.get("/", (req, res, next) => {
    const data = mylistData;
    // push 한 데이터 초기화, 중복 조회 방지
    mylistData = [];
    if(req.session.login) {
        if(data.length > 0) {
            res.render("main", {
                "data" : data,
                "eoa" : req.session.login.address
            })
        } else {
            res.render("main", {
                "data" : "empty",
                "eoa" : req.session.login.address
            })
        }
    } else {
        if(data.length > 0) {
            res.render("main", {
                "data" : data,
                "eoa" : "empty"
            })
        } else {
            res.render("main", {
                "data" : "empty",
                "eoa" : "empty"
            })
        }
    }
});

// 서버 실행시 로그 출력
app.listen(port, () => {
    console.log("서버 실행");
})