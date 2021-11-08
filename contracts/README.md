


Steps to deploy ENS on Avalance Testnet

1. Deploy ENSRegistry.sol (use the OwnerAccount)
2. Deploy BaseregistrarImplementation.sol with base node (Namehash of amafans) i.e 0x2c36ca5c2f315c648f49b490565ed094e37a6e8d230039597a7827db6fbea638
        ```
		registrar = await BaseRegistrar.new(ens.address, namehash.hash('amafans'), {from: ownerAccount});
		
        ```
    Use the OwnerAccount
3. Add a controller on the registrar contract for the OwnerAccount. The controller will be the account who will take actions on the behalf of the owner of 
the domain and obviously the contract owner.
    ```
		await registrar.addController(controllerAccount, {from: ownerAccount});
    ```
4. Add a subnode owner on the ENS contract, this will make the registrar contract the owner of the .amafans domain on the ens contract.
   Use labelhash of the amafans for this.

    ```
		await ens.setSubnodeOwner('0x0', sha3('amafans'), registrar.address);
    ```
5. Check if the ens contract is showing the right owner for the _node which is the output of this function 
    ```
    function rootNode(bytes32 _label) external pure returns(bytes32){
        bytes32 zeroBytes = 0x0;
        return keccak256(abi.encodePacked(zeroBytes, _label));
    }
    ```
    In case of amafans basenode, you should check 0x2c36ca5c2f315c648f49b490565ed094e37a6e8d230039597a7827db6fbea638 (output of the above function if 
        you put _label as 0x22eefbbc1c0b5e5abcfa458ff05bb36637914d1b055acf7c62a6a93c2210e8c6 i.e labelhash of amafans.
    with this value you should call recordExists function on the ens and the output should be true.
    
    Also, call function owner on ENS with this value and it should output the address of the BaseregistrarImplementation contract address.
    
6. Deploy PublicResolver with ENSRegistry contract address and WRAPPERADDRESS = 0x0000000000000000000000000000000000000000.
7. Call setResolver on the BaseregistrarImplementation with the owner of amafans node or its controller.
8. Deploy AMAENSCLient.sol with the ENSRegistry address, PublicResolver address and duration of your liking.
9. Add a controller (addController) on the BaseregistrarImplementation contract with AMAENSCLient contract address as an input, which means that 
AMAENSCLient contract can take actions on behalf of the BaseregistrarImplementation contract.
10. setController function has to be called on the AMAENSCLient contract with operator as the address which will actually call the 
registerNode function. for example, If we deployed the AMAENSCLient contract with rootAcccount, then setController has to be called 
from this rootAccount and the operator will the be the address which will call the register function on the contract.
10. The call register function on the AMAENSCLient contract with the name and the owner (Only owner of the contract can call the same).
Call function setApprovalForAll on the AMAENSCLient contract with the address of the AMACLient contract address in eth_contracts repository.

11.The resolver will the default publicResolver.


    "test" Label Hash: 0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658
    "test.amafans" Namehash: 
    seconds in an year: 31536000
    seconds in 10 years: 315360000
    
Deployed Addresses on FujiTestNet:
BaseregistrarImplementation: 0x64e8f34c28231D5d90148Be7bD4E76D39174D2DF
PublicResolver: 0xd1987D582cF4e3b4ff8141D8D52016877996cEb5
ENSRegistry: 0xB7E62FbB5F0AC4FEaCDF1394Cdc7933081B87483
AMAENSCLient: 0x69b92B7e01b81EaCD8E3F37203d08B923A0D5198





