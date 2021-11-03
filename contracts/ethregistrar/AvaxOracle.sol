// SPDX-License-Identifier: MIT
//Oracles information is available here:
//https://docs.chain.link/docs/avalanche-price-feeds/

//Mainnet: AVAX / USD	8	0x0A77230d17318075983913bC2145DB16C7366156
//TestNet: AVAX / USD	8	0x5498BB86BC934c8D34FDA08E81D444153d0D06aD

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {
    AggregatorV3Interface internal priceFeed;

    /**
     * Network: Kovan
     * Aggregator: ETH/USD
     * Address: 0x9326BFA02ADD2366b30bacB125260Af641031331
     */
    constructor() {
        priceFeed = AggregatorV3Interface(0x5498BB86BC934c8D34FDA08E81D444153d0D06aD);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }
}