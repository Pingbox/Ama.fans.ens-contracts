// const hre = require("hardhat");
web3 = require('web3')
namehash = require('eth-ens-namehash')

const { expect, assert } = require('chai');
require('dotenv').config()

const DURATION = 31536000
const ZERO_BYTES = "0x0000000000000000000000000000000000000000000000000000000000000000"
const WRAPPERADDRESS = "0x0000000000000000000000000000000000000000"
const ENSREGISTRY_ADDRESS = ""
const BASEREGISTRAR_ADDRESS = ""
const PUBLICRESOLVER_ADDRESS = ""
const AMAENSCLIENT_ADDRESS = ""

async function main() {

  // We get the contract to deploy
    // const Greeter = await ethers.getContractFactory("Greeter");
    // hre.ethers.provider.connection.url = "https://rinkeby.infura.io/v3/c3ba436414314c69904f0ee1d5132a87";
    const [owner,  feeCollector, operator] = await ethers.getSigners();
    const ensRegistryContractF = await ethers.getContractFactory("ENSRegistry");
    const baseRegistrarImplementationContractF = await ethers.getContractFactory("BaseRegistrarImplementation");
    const publicResolverContractF = await ethers.getContractFactory("PublicResolver");
    const amaENSClientContractF = await ethers.getContractFactory("AMAENSClient");

    let ensRegistry;
    let baseRegistrar;
    let publicResolver;
    let amaENSClient;
    console.log(`Owner address ${owner.address}`)
    console.log(`Feecollector address ${feeCollector.address}`)
    console.log(`operator address ${operator.address}`)

    const nameHash = namehash.hash(process.env.DOMAIN_NAME)
    const labelHash = web3.utils.sha3('amafans')
    const tokenId = web3.utils.toBN(web3.utils.sha3(Buffer.from("test", 'utf8'))).toString()
    const testDomain = "test" + "." + process.env.DOMAIN_NAME
    const testNameHash = namehash.hash(testDomain)


    console.log(`tokenID for testDomain ${testDomain} is ${tokenId}`)
    console.log(`Root Nodehash for ${process.env.DOMAIN_NAME} is ${nameHash}`)
    console.log(`LabelHash for ${process.env.DOMAIN_NAME} ${labelHash}`)
    console.log(`TestNodeHash ${testNameHash} for testDomain ${testDomain}`)

    // console.log("owner balance:", (await owner.getBalance()).toString());
    // console.log("operator balance:", (await operator.getBalance()).toString());
    // console.log("feeCollector balance:", (await feeCollector.getBalance()).toString());

    if (ENSREGISTRY_ADDRESS == ""){
      console.log( '\n', "Deploying ENS resgistry contract")
      ensRegistry = await ensRegistryContractF.deploy();
      await ensRegistry.deployed();
      console.log( "ensRegistry contract", ensRegistry.address);
    }else{
      console.log( '\n', `Loading ensRegistry from address ${ENSREGISTRY_ADDRESS}`)
      ensRegistry = await ensRegistryContractF.attach(ENSREGISTRY_ADDRESS);
    }
    


    if (BASEREGISTRAR_ADDRESS == ""){
      console.log( '\n', "Deploying BaseRegistrarImplementation contract")
      baseRegistrar = await baseRegistrarImplementationContractF.deploy(ensRegistry.address, nameHash);
      await baseRegistrar.deployed();
      console.log(`Adding a root subnode with \n ROOT_NODE=${ZERO_BYTES}, labelHash=${labelHash} and baseregistrar address=${baseRegistrar.address}`)
      //ens.setSubnodeOwner('0x0', sha3('amafans'), registrar.address)
      await ensRegistry.setSubnodeOwner(ZERO_BYTES, 
                                                      labelHash, 
                                                      baseRegistrar.address)

      console.log("Testing the deployed contracts by adding a controller to the registrar and adding a new test subdomain from this controller")
      //await registrar.addController(controllerAccount, {from: ownerAccount});
      //web3.utils.toBN((web3.utils.sha3(Buffer.from("test", 'utf8'))).toString();
      await baseRegistrar.addController(operator.address);

      console.log("\n", `Registering tokenID for testDomain ${testDomain} is ${tokenId}`)
      await baseRegistrar.connect(operator).register(tokenId, operator.address, DURATION);
      console.log(`Checking on recodExists function on ENS resgistry for NodeHash {testNameHash}`)
      var result = await ensRegistry.owner(testNameHash)
      console.log(result);
      assert(result == operator.address, "Owner of testDomain should be operator");

    }else{
      console.log( '\n', `Loading baseRegistrar from address ${BASEREGISTRAR_ADDRESS}`)
      baseRegistrar = await baseRegistrarImplementationContractF.attach(BASEREGISTRAR_ADDRESS)

    }
    console.log( "BaseRegistrarImplementation contract address", baseRegistrar.address);



    if (PUBLICRESOLVER_ADDRESS == ""){
      console.log( '\n', "Deploying public resolver")
      publicResolver = await publicResolverContractF.deploy(ensRegistry.address, WRAPPERADDRESS);
      await publicResolver.deployed();
      console.log( '\n', `Setting publicResolver address ${publicResolver.address} on baseRegistrar`)
      await baseRegistrar.connect(owner).setResolver(publicResolver.address);
      
    }else{
      console.log( '\n', `Loading publicResolver from address ${PUBLICRESOLVER_ADDRESS}`)
      publicResolver = await publicResolverContractF.attach(PUBLICRESOLVER_ADDRESS);
    }
    console.log( "publicResolver contract", publicResolver.address);


    if (AMAENSCLIENT_ADDRESS == ""){
      console.log( '\n', "Deploying AMAEnsClient resolver")
      amaENSClient = await amaENSClientContractF.deploy(baseRegistrar.address, publicResolver.address, DURATION);
      await amaENSClient.deployed();

      console.log("Adding amaENSClient contract address as an controller on the baseRegistrar contract")
      await baseRegistrar.addController(amaENSClient.address);
      
    }else{
      console.log( '\n', `Loading amaENSClient from address ${AMAENSCLIENT_ADDRESS}`)

      amaENSClient = await amaENSClientContractF.attach(AMAENSCLIENT_ADDRESS);

    }
    
    console.log( "amaENSClient contract address", amaENSClient.address);


  }



  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });