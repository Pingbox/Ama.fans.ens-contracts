// const hre = require("hardhat");
web3 = require('web3')
const { expect } = require('chai');
require('dotenv').config()



async function main() {

  // We get the contract to deploy
    // const Greeter = await ethers.getContractFactory("Greeter");
    // hre.ethers.provider.connection.url = "https://rinkeby.infura.io/v3/c3ba436414314c69904f0ee1d5132a87";
    const [admin,  feeCollector] = await ethers.getSigners();
    console.log("Admin balance:", (await admin.getBalance()).toString());
    console.log("feeCollector balance:", (await feeCollector.getBalance()).toString());


    const nftContract = await ethers.getContractFactory("AmaFansNFT");
    nft = await nftContract.deploy();
    await nft.deployed();
    console.log( "NFT contract", nft.address);


    const ProxyAdmin =  await ethers.getContractFactory('ProxyAdmin');
    proxyAdmin = await ProxyAdmin.deploy();
    await proxyAdmin.deployed();
    console.log( "proxyAdmin contract", proxyAdmin.address);

    const reputationContract = await ethers.getContractFactory("ReputationLib");
    reputationLib = await reputationContract.deploy();
    await reputationLib.deployed();
    console.log( "ReputationLib contract", reputationLib.address);


    const postslibArtifact = await ethers.getContractFactory("PostsLib", {
      libraries: {
        ReputationLib: reputationLib.address
    },
    });
    postsLib = await postslibArtifact.deploy();
    await postsLib.deployed();
    console.log("PostsLibContract contract", postsLib.address);


    const postsArtifact = await ethers.getContractFactory("Posts", { 
      libraries: {
        PostsLib: postsLib.address,
        ReputationLib: reputationLib.address
      },
    });

    posts = await postsArtifact.deploy();   
  await posts.deployed();

  console.log("Posts Contract", posts.address);

  const TransparentUpgradeable = await ethers.getContractFactory("TransparentUpgradeableProxy");

  postsProxy = await TransparentUpgradeable.deploy(posts.address, proxyAdmin.address, initializeData)
  await postsProxy.deployed();
  console.log("Posts Proxy Deployed", postsProxy.address);

  console.log("Attaching and initializing posts contract")
  const _posts = await posts.attach(postsProxy.address);
  await _posts.connect(feeCollector).initialize(maxSubPostLimit,
          minimumAmount,
          defaultSubPostLimit,
          feePercentage,
          thresholdValueForFee,
          nft.address,
          AMACLCLIENT_ADDRESS,
          feeCollector.address,
          admin.address);


  let MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
  await nft.grantRole(MINTER_ROLE, postsProxy.address);

  res = await nft.hasRole(MINTER_ROLE, postsProxy.address);
  console.log(`postProxy ${postsProxy.address} can mint tokens on nft contract ${nft.address} [${res}]`)
  }



  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });