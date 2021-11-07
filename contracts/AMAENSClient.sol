
// SPDX-License-Identifier: MIT


pragma solidity >=0.8.4;
import "./ethregistrar/BaseRegistrarImplementation.sol";
import "./resolvers/Resolver.sol";
import "./root/Controllable.sol";


contract AMAENSClient is Controllable {
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

    
    function register(string memory name, address owner) public onlyController {

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
}