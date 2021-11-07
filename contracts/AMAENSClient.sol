
// SPDX-License-Identifier: MIT


pragma solidity >=0.8.4;
pragma experimental ABIEncoderV2;

import "./ethregistrar/BaseRegistrarImplementation.sol";
import "./resolvers/Resolver.sol";
import "./root/Controllable.sol";


contract AMAENSClient is Controllable {
    
    string constant public TWITTER_KEY = "com.twitter";
    string constant public IS_TWITTER_VERIFIED_STRING = "isTwitterverified";
    string constant public NAME_STRING = "name";
    string constant public AVATAR_STRING = "avatar";
    string constant public TWITTERID_STRING = "twitterID";

    string constant public BOOL_FALSE_STRING = "False";
    string constant public BOOL_TRUE_STRING = "True";
    
    BaseRegistrarImplementation base;
    address resolver;
    uint duration;
    event NameRegistered(string name, bytes32 indexed label, address indexed owner, uint expires);
    event NameRenewed(string name, bytes32 indexed label,  uint expires);

    constructor(BaseRegistrarImplementation _base, address _resolver, uint _duration){
                base = _base;
                resolver = _resolver;
                duration = _duration;

    }

    
    function register(string memory name, address owner, string memory twitterUsername, bytes memory _bytes) public onlyController {

        (,string memory nameOnTwitter, string memory profileImage, string memory twitterID, bool isTwitterVerified, ) =  decode_data(_bytes);
        bytes32 label = keccak256(bytes(name));
        uint256 tokenId = uint256(label);
    

        uint expires;
        // Set this contract as the (temporary) owner, giving it
        // permission to set up the resolver.
        expires = base.register(tokenId, address(this), duration);

        // The nodehash of this label
        bytes32 nodehash = keccak256(abi.encodePacked(base.baseNode(), label));

        //set key value pairs here
        // Set the resolver
        base.ens().setResolver(nodehash, resolver);
        base.ens().setTTL(nodehash, uint64(expires));


        // Configure the resolver
        Resolver(resolver).setAddr(nodehash, owner);
        bytes[] memory multiCallData = _setTextMulticall(nodehash, isTwitterVerified, nameOnTwitter, twitterUsername, profileImage, twitterID);
        Resolver(resolver).multicall(multiCallData);

        // Now transfer full ownership to the expeceted owner
        base.reclaim(tokenId, owner);
        base.transferFrom(address(this), owner, tokenId);
    

        emit NameRegistered(name, label, owner, expires);


        }
        
        function renew(string calldata name, uint _duration) external payable onlyController {

            bytes32 label = keccak256(bytes(name));
            uint expires = base.renew(uint256(label), _duration);
    
            emit NameRenewed(name, label, expires);
    }
        
    function decode_data(bytes memory _bytes) private pure returns (string memory, string memory, string memory, string memory, bool, bool) {
        (string memory username, 
        string memory name, 
        string memory profile_image,
        string memory id,
        bool twitter_verified, 
        bool verified) = abi.decode(_bytes, (string,string,string,string,bool,bool));

        return (username, name, profile_image, id, twitter_verified, verified);
    }
    
    
        //https://github.com/ensdomains/ens-contracts/blob/master/contracts/root/Root.sol
    function _setTextMulticall(bytes32 nameHash, 
                    bool isTwitterVerified, 
                    string memory nameOnTwitter, 
                    string memory twitterUsername,
                    string memory profileImage, 
                    string memory twitterID) 
                    private 
                    pure
                    returns(bytes[] memory){
        bytes[] memory _data = new bytes[](5);

        if (isTwitterVerified){
            _data[2] = abi.encodeWithSignature("setText(bytes32,string,string)",nameHash,IS_TWITTER_VERIFIED_STRING,BOOL_TRUE_STRING);
            
        }else{
            _data[2] = abi.encodeWithSignature("setText(bytes32,string,string)",nameHash,IS_TWITTER_VERIFIED_STRING,BOOL_FALSE_STRING);
            
        }

        // abi.encodeWithSignature("add(uint256,uint256)", a, b)
        _data[0] = abi.encodeWithSignature("setText(bytes32,string,string)", nameHash, NAME_STRING, nameOnTwitter);
        _data[1] = abi.encodeWithSignature("setText(bytes32,string,string)",nameHash,TWITTER_KEY,twitterUsername);
        _data[3] = abi.encodeWithSignature("setText(bytes32,string,string)",nameHash,AVATAR_STRING,profileImage);
        _data[4] = abi.encodeWithSignature("setText(bytes32,string,string)",nameHash,TWITTERID_STRING,twitterID);
        return _data;

    }
}