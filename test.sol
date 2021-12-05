pragma solidity ^0.8.0;

contract test{
        bytes32 constant public BASENODE = 0x2c36ca5c2f315c648f49b490565ed094e37a6e8d230039597a7827db6fbea638;

    function calTokenId(string memory _label) external pure returns (uint256){
        bytes32 label = keccak256(bytes(_label));
        return uint256(label);
    }
    
    function getNodeHash(string memory _label) external pure returns (bytes32,bytes32,uint256){
        bytes32 label = keccak256(bytes(_label));
        uint256 tokenId = uint256(label);
        return (label, keccak256(abi.encodePacked(BASENODE, label)), tokenId);

    }
}



