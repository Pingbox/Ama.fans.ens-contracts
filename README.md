This is the fork of the official ENS Repository. https://github.com/ensdomains .
Because of the unavailability of the ENS repository on AVAX, We created this fork to let our users have access
to the subdomains, To have an identity to be used on AMA.Fans platform.


#### labelhash of amafans: 0x2c36ca5c2f315c648f49b490565ed094e37a6e8d230039597a7827db6fbea638: 



- #### ENSRegistry takes care of the root domain, its subdomains (in this case only one amafans) 
    and all the other subdomains of subdomains and so on. WHoever deploys this contract becomes the 
    owner of rootDomain 0X0 ``` records[0x0].owner = msg.sender; ```

- #### BaseRegistrar which actually owns the root domain and has the relevant permissions to control the rootDomain.It has the 
    relevant permissions to register, renew, reclaim  and controllers.

- #### _RootDomain_: 0x0000000000000000000000000000000000000000000000000000000000000000
    - #### _SubDomain_ :  0x2c36ca5c2f315c648f49b490565ed094e37a6e8d230039597a7827db6fbea638 (Namehash of amafans)
        - #### _AllSubDomains: 0x22eefbbc1c0b5e5abcfa458ff05bb36637914d1b055acf7c62a6a93c2210e8c6 (labelHash of amafans)
            - #### _RestOfTheSubmainsUnderit_ : calculate the labelhash of the string and call setSubnodeOwner.


- #### 		await ens.setSubnodeOwner('0x0', sha3('amafans'), registrar.address);
        this ensures that amafans is actually a subdomain of the rootDomain which is 0X0. and every other 
        domain will be created as a subdomain of amafans.


#### Steps to deploy ENS on Avalance Testnet:

1. Deploy ENSRegistry.sol (use the OwnerAccount)
2. Deploy BaseregistrarImplementation.sol with base node (Namehash of amafans) i.e 0x2c36ca5c2f315c648f49b490565ed094e37a6e8d230039597a7827db6fbea638
        ```
		    registrar = await BaseRegistrar.new(ens.address, namehash.hash('amafans'), {from: ownerAccount});
		
        ```
    Use the OwnerAccount

3. Add a subnode owner on the ENS contract, this will make the registrar contract the owner of the .amafans domain on the ens contract.
   Use labelhash of the amafans for this. this is saying that the root node is 0x0 and the subnode is sha3(amafans). This has to be 
   called from the address who deployed ens registry contract.  this also sets the owner of the amafans as the Baseregistrar. 
   All actions for creating subdomains on .amafans has to called by baseregistrar function.

    ```
		await ens.setSubnodeOwner('0x0', sha3('amafans'), registrar.address);
    ```

3. Testing the deployed contracts
    - #### First you need to add a controller to Baseregister so that address can create a new subdomain on amafans.
            So, the address who deployed the Baseregistrar must call addController with another address2
            lets call it address_2(will create subdomain):

            ```
                await registrar.addController(controllerAccount, {from: ownerAccount});
            ```
            after this address_2 can call register function on the BaseRegistrar and a subdomain on ENS will
            be created. 
    - #### lets create a new subdomain test.amafans.
            ```
                  
            function getNodeHash(string memory _label) external pure returns (bytes32,bytes32,uint256){
                bytes32 label = keccak256(bytes(_label));
                uint256 tokenId = uint256(label);
                return (label, keccak256(abi.encodePacked(BASENODE, label)), tokenId);

            }
            BASENODE is namehash of AMAFans.
            ```
            tokenId(testtest) = 67435640317129182582718462181570828843921522365924705664471817704192171889286
            owner = "0x0000000000000000000000000000000000000001"
            duration = 31536000
            Call register from address_2
    - #### lets check on ENSRegistry if this subdomain has been created or not.
            use getNodeHash function with input as "testtest" and use this ```keccak256(abi.encodePacked(BASENODE, label))```
            to ge the nodehash. With this nodeHash call recordExists and you will seee the owner as same as above.


    
5. Deploy PublicResolver with ENSRegistry contract address and WRAPPERADDRESS = 0x0000000000000000000000000000000000000000.
7. Call setResolver on the BaseregistrarImplementation with the owner of amafans node or its controller.
8. Deploy AMAENSCLient.sol with the BaseregistrarImplementation address, PublicResolver address and duration of your liking.

9. Add a controller (addController) on the BaseregistrarImplementation contract with AMAENSCLient contract address as an input, which means that 
AMAENSCLient contract can take actions on behalf of the BaseregistrarImplementation contract. This is required because before this 
only baseregistrar could create subdomains for amafans on ENSregistry contract.

10. setController function has to be called on the AMAENSCLient contract with operator as the address which will actually call the 
registerNode function. for example, If we deployed the AMAENSCLient contract with rootAcccount, then setController has to be called 
from this rootAccount and the operator will the be the address which will call the register function on the contract.
10. The call registerNode function on the AMAENSCLient contract with the name and the owner (Only owner of the contract can call the same).
11. Call function setApprovalForAll on the AMAENSCLient contract with the address of the AMACLCLient contract address in core_contracts repository.

11.The resolver will the default publicResolver.


    "test" Label Hash: 0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658
    "test.amafans" Namehash: 
    seconds in an year: 31536000
    seconds in 10 years: 315360000

BASENODE AMAfans: 0x2c36ca5c2f315c648f49b490565ed094e37a6e8d230039597a7827db6fbea638
LABELHASH AMAfans: 0x22eefbbc1c0b5e5abcfa458ff05bb36637914d1b055acf7c62a6a93c2210e8c6
ROOTNODE: 0x0000000000000000000000000000000000000000000000000000000000000000




##### Deployments on Fuji Testnet:
- #### _ENSRegistry_: 0x970e7636f5e3A09a41057D6bC9E54a20CAfbf4a3
- #### _BaseregistrarImplementation_: 0xFf4a5dee897fbD650F1AEb5c5ef214b9425122eF. _OWNER_: 0xFfc3CFEDe3b7fEb052B4C1299Ba161d12AeDf135
- #### _PublicResolver_: 0xe30C409CF769912f9359625c6B33bc9959d0E95f
- #### _AMAENSCLient_: 0x291bbf7F5712ea859C0D8851913e32a47D95FDB9 _OWNER_: 0xFfc3CFEDe3b7fEb052B4C1299Ba161d12AeDf135
