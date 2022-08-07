// env 파일을 읽기 위한 선언
require("dotenv").config();

// Klaytn API Service 설정 - 따로 작성하기 
const CaverExtKAS = require("caver-js-ext-kas");

// Klaytn API Service 인스턴스 생성 후 변수 할당
const kasApi = new CaverExtKAS();

// in-memory wallet인 KeyringContainer 사용하여 외부지갑 등록 인스턴스 생성
const keyringContainer = new kasApi.keyringContainer();

// keyringContainer에 등록하여 사용할 외부 지갑 privatekey를 등록해줌
const keyring = keyringContainer.keyring.createFromPrivateKey(process.env.mainPK) 
keyringContainer.add(keyring); // 새로운 월렛 추가(KAS 지갑주소가 아닌 외부 지갑 주소)

// Klaytn API Service 초기화 - 사용하기 위해 정보를 넣어줌 / 현재 chainId 1001(test-net)
kasApi.initKASAPI(process.env.KASchainId, process.env.KASaccesskey, process.env.KASsecretkey);

module.exports = {
    kasApi,
    keyring
};