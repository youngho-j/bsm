const caverjs = require("caver-js");

// 컨트랙 관리 파일
const contractEnv = require("../contractLast.json");

// env 파일을 읽기 위한 선언
require("dotenv").config();

// caverjs를 이용하여 klaytn test net 접속을 위한 경로 설정
const testConn = new caverjs("https://api.baobab.klaytn.net:8651");

// 컨트랙 실행을 위한 abi 및 CA 등록 
const smartContract = new testConn.klay.Contract(contractEnv.abi, contractEnv.ca);

// 지갑 주소, 프라이빗 키 등록
const account = testConn.klay.accounts.createWithAccountKey(process.env.mainWA, process.env.mainPK);
testConn.klay.accounts.wallet.add(account);

module.exports = {
    smartContract,
    testConn
};