const express = require("express");
const app = express();
const port = 3000;

// env 환경 설정 읽어오기 위한 설정 - 현재 얘는 쓰는 곳 없음
require("dotenv").config();

// ejs 파일 읽어오기 위한 엔진 및 경로 설정
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// 정적 파일 경로 설정 - public 폴더 아래에 js, css, img 폴더들
app.use(express.static('public'));

// post 형식의 데이터를 읽어 오기 위한 설정
app.use(express.json());
app.use(express.urlencoded({
    extended:false
}));

// 아래 경로가 포함된 요청이 있을 경우 해당 js파일로 라우팅(전달) 됨
app.use("/nft", require("./routes/mint.js"));
app.use("/user", require("./routes/user.js"));

// 서버 로딩후 가장 처음 보여주는 페이지
app.get("/", (req, res) => {
    res.render("main");
});

// 서버 실행시 로그 출력
app.listen(port, () => {
    console.log("서버 실행");
})