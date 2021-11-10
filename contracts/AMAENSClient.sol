
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
    
    address private baseAddr;
    address private resolver;
    uint private duration;
    event NameRegistered(string name, bytes32 indexed label, address indexed owner, uint expires);
    event NameRenewed(string name, bytes32 indexed label,  uint expires);

    constructor(address _baseRegistrarImplementation, address _resolver, uint _duration){
                baseAddr = _baseRegistrarImplementation;
                resolver = _resolver;
                duration = _duration;

    }

    /**
     * @dev Create a nodehash from the label with the help of the Namehash of the root domain.
     * @param _label The _label for the domain like test.amafans, test is the label.
    */
    function getNodeHash(string memory _label) external view returns (bytes32,bytes32,uint256){
        bytes32 label = keccak256(bytes(_label));
        uint256 tokenId = uint256(label);
        return (label, keccak256(abi.encodePacked(BaseRegistrarImplementation(baseAddr).baseNode(), label)), tokenId);

    }
    
    /**
     * @dev Create a nodehash from the label with the help of the Namehash of the root domain.
     * @param _nodehash Nomehash of the full domain like Namehash(test.amafans).
     * @param isTwitterVerified if the user has blue tick on the twitter profile or not.
     * @param nameOnTwitter Name of the person as he puts it on the twitter profile.
     * @param twitterUsername The twitter username of the person present on the twitter profile
     * @param profileImage The url of the profileImage on the twitter account, this will be empty string if none is available
     * @param twitterID this is the only thing unique, unchanged for a twitter account since it is internal to twitter
    */
    function _setKeyPairs(bytes32 _nodehash,
                        bool isTwitterVerified,
                        string memory nameOnTwitter,
                        string memory twitterUsername,
                        string memory profileImage,
                        string memory twitterID
                    ) 
                    private {
        bytes[] memory multiCallData = _setTextMulticall(_nodehash, isTwitterVerified, nameOnTwitter, twitterUsername, profileImage, twitterID);
        Resolver(resolver).multicall(multiCallData);
    }

    /**
    * @dev Transfers ownership of a node to a new address. May only be called by the current owner of the node.
     * @param tokenId The node to transfer ownership of.
     * @param owner The address of the new owner.
    */
    function _transferOwnership(uint256 tokenId, address owner) private {
        BaseRegistrarImplementation(baseAddr).reclaim(tokenId, owner);
        BaseRegistrarImplementation(baseAddr).transferFrom(address(this), owner, tokenId);
    }

    function _setResolverValues(bytes32 nodehash, address _owner) private  {
        Resolver(resolver).setAddr(nodehash, _owner);
    }


    function registerNode(address _owner, 
                bytes memory _bytes,
                string memory twitterUsername)
                external 
                onlyController
                returns (bytes32, string memory){
            (string memory subdomain, 
            string memory nameOnTwitter, 
            string memory profileImage, 
            string memory twitterID, 
            bool isTwitterVerified) =  _decodeData(_bytes);

        // bytes32 label = keccak256(bytes(_label));
        // uint256 tokenId = uint256(label);
    
        // The nodehash of this label
        (bytes32 label, bytes32 nodehash, uint256 tokenId) = this.getNodeHash(subdomain);
        //check if the tokenId is available or nor
        if (!BaseRegistrarImplementation(baseAddr).available(tokenId)){
            revert("This domain is not available");
        }
        uint256 expires = _register(nodehash, tokenId);



        // Configure the resolver
        _setResolverValues(nodehash, _owner);

        _setKeyPairs(nodehash, isTwitterVerified, nameOnTwitter, twitterUsername, profileImage, twitterID);

        // Now transfer full ownership to the expeceted owner
        _transferOwnership(tokenId, _owner);

        emit NameRegistered(subdomain, label, _owner, expires);
        return (nodehash, subdomain);
    }
    
    
    function _register(bytes32 nodehash, 
                uint256 tokenId)
                private 
                returns(uint256){
         uint256 expires =BaseRegistrarImplementation(baseAddr).register(tokenId, address(this), duration);

        //set key value pairs here
        // Set the resolver
        BaseRegistrarImplementation(baseAddr).ens().setResolver(nodehash, resolver);
        BaseRegistrarImplementation(baseAddr).ens().setTTL(nodehash, uint64(expires));
        return expires;
    }

        
    function renew(string calldata name, uint _duration) external onlyController {

            bytes32 label = keccak256(bytes(name));
            uint expires = BaseRegistrarImplementation(baseAddr).renew(uint256(label), _duration);
            emit NameRenewed(name, label, expires);
    }
        
    function _decodeData(bytes memory _bytes) private pure returns (string memory, string memory, string memory, string memory, bool) {
        (string memory username, 
        string memory name, 
        string memory profileImage,
        string memory id,
        bool twitterVerified) = abi.decode(_bytes, (string,string,string,string,bool));

        return (username, name, profileImage, id, twitterVerified);
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