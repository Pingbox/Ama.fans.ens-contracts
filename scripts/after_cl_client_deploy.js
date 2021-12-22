// const hre = require("hardhat");
web3 = require('web3')
namehash = require('eth-ens-namehash')

// const { expect, assert } = require('chai');
// require('dotenv').config()

const AMAENSCLIENT_ADDRESS = "0x781baa25B5BE7Ee75EB2BdBB44e2342648Ad0d4C"
const AMACLCLIENT_ADDRESS = process.env.AMACLCLIENT_ADDRESS

async function main() {

  // We get the contract to deploy
    // const Greeter = await ethers.getContractFactory("Greeter");
    // hre.ethers.provider.connection.url = "https://rinkeby.infura.io/v3/c3ba436414314c69904f0ee1d5132a87";
    const [owner,  feeCollector, operator] = await ethers.getSigners();
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


    if (AMACLCLIENT_ADDRESS == ""){
        throw new Error('AMACLClient address is required');
      
    }

    if (AMAENSCLIENT_ADDRESS == ""){
        throw new Error('AMAENSClient address is required');
      
    }else{
      console.log( '\n', `Loading amaENSClient from address ${AMAENSCLIENT_ADDRESS}`)
      amaENSClient = await amaENSClientContractF.attach(AMAENSCLIENT_ADDRESS);
      console.log( "amaENSClient contract address on which the operator will be added is", amaENSClient.address);
      console.log(`AMACLCLIENT_ADDRESS is ${AMACLCLIENT_ADDRESS}`)
    }
    
    const contractOwner = await amaENSClient.connect(owner).owner();
    if (owner.address !== contractOwner){
        throw new Error((`AMAENSClient contract at ${amaENSClient.address} has a different owner ${contractOwner}`))
    }


    await amaENSClient.connect(owner).setController(AMACLCLIENT_ADDRESS, true);


  }



  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });