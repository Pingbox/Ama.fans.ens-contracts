// const hre = require("hardhat");
web3 = require('web3')
namehash = require('eth-ens-namehash')

const { expect, assert } = require('chai');
require('dotenv').config()

const DURATION = 31536000
const ZERO_BYTES = "0x0000000000000000000000000000000000000000000000000000000000000000"
const WRAPPERADDRESS = "0x0000000000000000000000000000000000000000"
async function main() {

  // We get the contract to deploy
    // const Greeter = await ethers.getContractFactory("Greeter");
    // hre.ethers.provider.connection.url = "https://rinkeby.infura.io/v3/c3ba436414314c69904f0ee1d5132a87";
    const [owner,  feeCollector, operator] = await ethers.getSigners();
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

    console.log( '\n', "Deploying ENS resgistry contract")
    const ensRegistryContract = await ethers.getContractFactory("ENSRegistry");
    ensRegistry = await ensRegistryContract.deploy();
    await ensRegistry.deployed();
    console.log( "ensRegistry contract", ensRegistry.address);

    const baseRegistrarImplementation = await ethers.getContractFactory("BaseRegistrarImplementation");

    console.log( '\n', "Deploying BaseRegistrarImplementation contract")
    baseRegistrarImplementationContract = await baseRegistrarImplementation.deploy(ensRegistry.address, nameHash);
    await baseRegistrarImplementationContract.deployed();
    console.log( "BaseRegistrarImplementation contract", baseRegistrarImplementationContract.address);


    console.log(`Adding a root subnode with \n ROOT_NODE=${ZERO_BYTES}, labelHash=${labelHash} and baseregistrar address=${baseRegistrarImplementationContract.address}`)
    //ens.setSubnodeOwner('0x0', sha3('amafans'), registrar.address)
    await ensRegistry.setSubnodeOwner(ZERO_BYTES, 
                                                    labelHash, 
                                                    baseRegistrarImplementationContract.address)

    console.log("Testing the deployed contracts by adding a controller to the registrar and adding a new test subdomain from this controller")
    //await registrar.addController(controllerAccount, {from: ownerAccount});
    //web3.utils.toBN((web3.utils.sha3(Buffer.from("test", 'utf8'))).toString();
    await baseRegistrarImplementationContract.addController(operator.address);

    await baseRegistrarImplementationContract.register(tokenId, operator.address, DURATION);
    console.log(`Checking on recodExists function on ENS resgistry for NodeHash {testNameHash}`)
    var result = await ensRegistry.owner(testNameHash)
    console.log(result);
    assert(result == operator.address, "Owner of testDomain should be operator");


    //Deploy PublicResolver with ENSRegistry contract address and WRAPPERADDRESS = 0x0000000000000000000000000000000000000000
    console.log( '\n', "Deploying public resolver")
    const publicResolverContract = await ethers.getContractFactory("PublicResolver");
    PublicResolver = await publicResolverContract.deploy(ensRegistry.address, WRAPPERADDRESS);
    await PublicResolver.deployed();
    console.log( "PublicResolver contract", PublicResolver.address);


  //   const ProxyAdmin =  await ethers.getContractFactory('ProxyAdmin');
  //   proxyAdmin = await ProxyAdmin.deploy();
  //   await proxyAdmin.deployed();
  //   console.log( "proxyAdmin contract", proxyAdmin.address);

  //   const reputationContract = await ethers.getContractFactory("ReputationLib");
  //   reputationLib = await reputationContract.deploy();
  //   await reputationLib.deployed();
  //   console.log( "ReputationLib contract", reputationLib.address);


  //   const postslibArtifact = await ethers.getContractFactory("PostsLib", {
  //     libraries: {
  //       ReputationLib: reputationLib.address
  //   },
  //   });
  //   postsLib = await postslibArtifact.deploy();
  //   await postsLib.deployed();
  //   console.log("PostsLibContract contract", postsLib.address);


  //   const postsArtifact = await ethers.getContractFactory("Posts", { 
  //     libraries: {
  //       PostsLib: postsLib.address,
  //       ReputationLib: reputationLib.address
  //     },
  //   });

  //   posts = await postsArtifact.deploy();   
  // await posts.deployed();

  // console.log("Posts Contract", posts.address);

  // const TransparentUpgradeable = await ethers.getContractFactory("TransparentUpgradeableProxy");

  // postsProxy = await TransparentUpgradeable.deploy(posts.address, proxyAdmin.address, initializeData)
  // await postsProxy.deployed();
  // console.log("Posts Proxy Deployed", postsProxy.address);

  // console.log("Attaching and initializing posts contract")
  // const _posts = await posts.attach(postsProxy.address);
  // await _posts.connect(feeCollector).initialize(maxSubPostLimit,
  //         minimumAmount,
  //         defaultSubPostLimit,
  //         feePercentage,
  //         thresholdValueForFee,
  //         nft.address,
  //         AMACLCLIENT_ADDRESS,
  //         feeCollector.address,
  //         admin.address);


  // let MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
  // await nft.grantRole(MINTER_ROLE, postsProxy.address);

  // res = await nft.hasRole(MINTER_ROLE, postsProxy.address);
  // console.log(`postProxy ${postsProxy.address} can mint tokens on nft contract ${nft.address} [${res}]`)
  }



  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });