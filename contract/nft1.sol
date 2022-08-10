contract KIP17TokenOwnable is KIP17Full, KIP17MintableOwnable, KIP17MetadataMintableOwnable, KIP17Burnable, KIP17Pausable {
    constructor (string memory name, string memory symbol) public KIP17Full(name, symbol) {
    }

         // 우리 사이트를 이용해서 여태까지 민팅한 총 NFT의 개수
    uint totalMintNumber = 0;
    // 우리 사이트에서 발행한 NFT 기록(한번에 발행한 수)을 저장하는 동적 배열 
    uint[] MintIndex ;
    uint[] MintIndexSum ;

    // {tokenURI,해당 NFT 개수}를 data로 갖는 구조체
    struct myNftInfo{
    string TokenURI;
    uint ownedNumberOfNft;
    }
    // string public name;

    // // Token symbol
    // string public _symbol;



    // 입력한 지갑주소 (to) 에 입력한 메타데이터(tokenURI)를 넣어서 원하는 개수(numberOfNft)만큼 NFT를 민팅해주는 함수  
    function mintWithTokenURI(address to, uint numberOfNft, string memory tokenURI) public returns (bool) {

        for (uint i = totalMintNumber; i < totalMintNumber + numberOfNft; i ++){
            _mint(to, i);
            _setTokenURI(i,tokenURI);
        }
        totalMintNumber += numberOfNft;
        MintIndex.push(numberOfNft);
        MintIndexSum.push(totalMintNumber);
        return true;  
    }


    // 입력한 주소의 지갑에 있는 NFT들을 조사해서 NFT 개수를 업데이트 시켜주는 함수 
    function updateMyNftList (address owner) public view returns(myNftInfo[] memory){

        // 현재 가지고 있는 NFT tokenId 리스트 생성하기
        uint[] memory tokenIdList = new uint[](balanceOf(owner));
        uint[] memory nftNumberList = new uint[](MintIndex.length);
        string[] memory tokenURIList = new string[](MintIndex.length);
        myNftInfo[] memory MyNftInfo = new myNftInfo[](MintIndex.length);

        for (uint l = 0; l < balanceOf(owner); l ++){
            tokenIdList[l]=(tokenOfOwnerByIndex(owner,l));
        }

        for (uint i = 0; i < balanceOf(owner); i ++){
            if(tokenOfOwnerByIndex(owner,i) < MintIndex[0]){
                nftNumberList[0] += 1;}
        }

        for (uint j = 0; j < MintIndex.length-1; j++){
            for (uint k = 0; k < balanceOf(owner); k ++){
                if(tokenOfOwnerByIndex(owner,k) >= MintIndexSum[j] && tokenOfOwnerByIndex(owner,k) < MintIndexSum[j+1]){
                    nftNumberList[j+1] += 1;}
            }
        }   

        for (uint i = 0; i < MintIndex.length; i++){
            tokenURIList[i] = (tokenURI(MintIndexSum[i]-1));
        }

        for (uint i = 0; i < MintIndex.length; i++){
            MyNftInfo[i] = myNftInfo(tokenURIList[i],nftNumberList[i]);
        }

        return MyNftInfo;
    }
    
   // 판매 등록 컨트랙트
   // 한 지갑에 모든 nft 합쳐서 400 개 정도가 최대
   // 팔떄는 한번에 200개 정도가 최대 
   // 로그인한 사람의 address, 가격, 판매 개수, NFT의 토큰 URI
   function salesRes (address owner, uint price, uint numberOfSales, string memory _tokenURI) public returns (bool) {
   
       require(numberOfSales > 0, "0개보다 더 많은 개수를 입력해주세요.");
       
       uint j = 0;
       uint[] memory tokenIdList = new uint[](balanceOf(owner));
       
       for (uint i=0; i < balanceOf(owner); i ++){
           
            if(keccak256(bytes(tokenURI(tokenOfOwnerByIndex(owner,i)))) == keccak256(bytes(_tokenURI))){
               
               tokenIdList[i]=tokenOfOwnerByIndex(owner,i);
            }
       }
       uint k = balanceOf(owner);
       for (uint i=0; i < k; i++){
           if((tokenIdList[i] != 0 && j < numberOfSales)){
           transferFrom(msg.sender,0x45C535cf60c7782617c7f3B7c5CE5Fd92B9A9f51,tokenIdList[i]);
           j += 1;
           }

       }
       
       
   }
}