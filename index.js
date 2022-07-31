const express = require("express");
const app = express();
const port = 3000;

require("dotenv");

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({
    extended:false
}));

app.use("/nft", require("./routes/mint.js"));
app.use("/user", require("./routes/user.js"));

app.get("/", (req, res) => {
    res.render("main");
});

app.listen(port, () => {
    console.log("서버 실행");
})