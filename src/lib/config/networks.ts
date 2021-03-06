import { ChainId } from '@aave/contract-helpers';

export const networks = {
  [ChainId.kovan]: {
    name: 'Kovan',
    publicJsonRPCUrl: ['https://eth-kovan.alchemyapi.io/v2/demo', 'https://eth-kovan.alchemyapi.io/v2/demo'],
    addresses: {
      walletBalanceProvider: '0x70F0DF55A149CfE9E0B2731E9Eb0cf1AB05C3AF5',
      uiPoolDataProvider: '0xd2D1BD0F44ed8f0B681FBB86BFf232E7a603ac0F',
      uiIncentiveDataProvider: '0xcddF8281621708e6aEa71f842e8B31646c6BFea0',
      chainlinkFeedRegistry: '0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0',
    },
    protocolDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-kovan',
    baseUniswapAdapter: '0xf86Be05f535EC2d217E4c6116B3fa147ee5C05A1',
    baseAsset: 'ETH',
    baseAssetWrappedAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    // incentives hardcoded information
    rewardTokenSymbol: 'stkAAVE',
    rewardTokenAddress: '0xb597cd8d3217ea6477232f9217fa70837ff667af',
    rewardTokenDecimals: 18,
    explorerLink: 'https://kovan.etherscan.io',
    rpcOnly: true,
    isTestnet: true,
  },
  [ChainId.mainnet]: {
    name: 'Ethereum mainnet',
    publicJsonRPCUrl: [
      'https://cloudflare-eth.com',
      'https://rpc.flashbots.net',
      // 'https://eth-mainnet.alchemyapi.io/v2/demo',
    ],
    publicJsonRPCWSUrl: 'wss://eth-mainnet.alchemyapi.io/v2/demo',
    addresses: {
      walletBalanceProvider: '0x8E8dAd5409E0263a51C0aB5055dA66Be28cFF922',
      uiPoolDataProvider: '0x47e300dDd1d25447482E2F7e5a5a967EA2DA8634',
      uiIncentiveDataProvider: '0xd9F1e5F70B14b8Fd577Df84be7D75afB8a3A0186',
      chainlinkFeedRegistry: '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf',
    },
    cachingServerUrl: 'https://cache-api-mainnet.aave.com/graphql',
    cachingWSServerUrl: 'wss://cache-api-mainnet.aave.com/graphql',
    protocolDataUrl: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2',
    baseUniswapAdapter: '0xc3efa200a60883a96ffe3d5b492b121d6e9a1f3f',
    baseAsset: 'ETH',
    baseAssetWrappedAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    // incentives hardcoded information
    rewardTokenSymbol: 'stkAAVE',
    rewardTokenAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    rewardTokenDecimals: 18,
    explorerLink: 'https://etherscan.io',
    rpcOnly: false,
  },
};
