import { ethers } from "ethers";
import config from "../config"
const ammSymbolMap: Record<string, string> = {
    '0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5': 'UNIDAIUSDC',
    '0x004375dff511095cc5a197a54140a24efef3a416': 'UNIWBTCUSDC',
    '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11': 'UNIDAIWETH',
    '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc': 'UNIUSDCWETH',
    '0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f': 'UNIAAVEWETH',
    '0xb6909b960dbbe7392d405429eb2b3649752b4838': 'UNIBATWETH',
    '0x3da1313ae46132a397d90d95b1424a9a7e3e0fce': 'UNICRVWETH',
    '0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974': 'UNILINKWETH',
    '0xc2adda861f89bbb333c90c492cb837741916a225': 'UNIMKRWETH',
    '0x8bd1661da98ebdd3bd080f0be4e6d9be8ce9858c': 'UNIRENWETH',
    '0x43ae24960e5534731fc831386c07755a2dc33d47': 'UNISNXWETH',
    '0xd3d2e2692501a5c9ca623199d38826e513033a17': 'UNIUNIWETH',
    '0xbb2b8038a1640196fbe3e38816f3e67cba72d940': 'UNIWBTCWETH',
    '0x2fdbadf3c4d5a8666bc06645b8358ab803996e28': 'UNIYFIWETH',
    '0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5': 'BPTWBTCWETH',
    '0x59a19d8c652fa0284f44113d0ff9aba70bd46fb4': 'BPTBALWETH',
};
const _abi = [
    {
      inputs: [
        {
          internalType: 'contract IChainlinkAggregator',
          name: '_networkBaseTokenPriceInUsdProxyAggregator',
          type: 'address',
        },
        {
          internalType: 'contract IChainlinkAggregator',
          name: '_marketReferenceCurrencyPriceInUsdProxyAggregator',
          type: 'address',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      inputs: [],
      name: 'ETH_CURRENCY_UNIT',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'contract ILendingPoolAddressesProvider',
          name: 'provider',
          type: 'address',
        },
      ],
      name: 'getReservesData',
      outputs: [
        {
          components: [
            {
              internalType: 'address',
              name: 'underlyingAsset',
              type: 'address',
            },
            {
              internalType: 'string',
              name: 'name',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'symbol',
              type: 'string',
            },
            {
              internalType: 'uint256',
              name: 'decimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'baseLTVasCollateral',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'reserveLiquidationThreshold',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'reserveLiquidationBonus',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'reserveFactor',
              type: 'uint256',
            },
            {
              internalType: 'bool',
              name: 'usageAsCollateralEnabled',
              type: 'bool',
            },
            {
              internalType: 'bool',
              name: 'borrowingEnabled',
              type: 'bool',
            },
            {
              internalType: 'bool',
              name: 'stableBorrowRateEnabled',
              type: 'bool',
            },
            {
              internalType: 'bool',
              name: 'isActive',
              type: 'bool',
            },
            {
              internalType: 'bool',
              name: 'isFrozen',
              type: 'bool',
            },
            {
              internalType: 'uint128',
              name: 'liquidityIndex',
              type: 'uint128',
            },
            {
              internalType: 'uint128',
              name: 'variableBorrowIndex',
              type: 'uint128',
            },
            {
              internalType: 'uint128',
              name: 'liquidityRate',
              type: 'uint128',
            },
            {
              internalType: 'uint128',
              name: 'variableBorrowRate',
              type: 'uint128',
            },
            {
              internalType: 'uint128',
              name: 'stableBorrowRate',
              type: 'uint128',
            },
            {
              internalType: 'uint40',
              name: 'lastUpdateTimestamp',
              type: 'uint40',
            },
            {
              internalType: 'address',
              name: 'aTokenAddress',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'stableDebtTokenAddress',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'variableDebtTokenAddress',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'interestRateStrategyAddress',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'availableLiquidity',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'totalPrincipalStableDebt',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'averageStableRate',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'stableDebtLastUpdateTimestamp',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'totalScaledVariableDebt',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'priceInMarketReferenceCurrency',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'variableRateSlope1',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'variableRateSlope2',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'stableRateSlope1',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'stableRateSlope2',
              type: 'uint256',
            },
          ],
          internalType: 'struct IUiPoolDataProvider.AggregatedReserveData[]',
          name: '',
          type: 'tuple[]',
        },
        {
          components: [
            {
              internalType: 'uint256',
              name: 'marketReferenceCurrencyUnit',
              type: 'uint256',
            },
            {
              internalType: 'int256',
              name: 'marketReferenceCurrencyPriceInUsd',
              type: 'int256',
            },
            {
              internalType: 'int256',
              name: 'networkBaseTokenPriceInUsd',
              type: 'int256',
            },
            {
              internalType: 'uint8',
              name: 'networkBaseTokenPriceDecimals',
              type: 'uint8',
            },
          ],
          internalType: 'struct IUiPoolDataProvider.BaseCurrencyInfo',
          name: '',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'contract ILendingPoolAddressesProvider',
          name: 'provider',
          type: 'address',
        },
      ],
      name: 'getReservesList',
      outputs: [
        {
          internalType: 'address[]',
          name: '',
          type: 'address[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'contract ILendingPoolAddressesProvider',
          name: 'provider',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
      ],
      name: 'getUserReservesData',
      outputs: [
        {
          components: [
            {
              internalType: 'address',
              name: 'underlyingAsset',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'scaledATokenBalance',
              type: 'uint256',
            },
            {
              internalType: 'bool',
              name: 'usageAsCollateralEnabledOnUser',
              type: 'bool',
            },
            {
              internalType: 'uint256',
              name: 'stableBorrowRate',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'scaledVariableDebt',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'principalStableDebt',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'stableBorrowLastUpdateTimestamp',
              type: 'uint256',
            },
          ],
          internalType: 'struct IUiPoolDataProvider.UserReserveData[]',
          name: '',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'marketReferenceCurrencyPriceInUsdProxyAggregator',
      outputs: [
        {
          internalType: 'contract IChainlinkAggregator',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'networkBaseTokenPriceInUsdProxyAggregator',
      outputs: [
        {
          internalType: 'contract IChainlinkAggregator',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
];

export class Pool{
    private readonly _contract;
    
    public constructor() {
        const { chainId, publicJsonRPCUrl, addresses: { uiPoolDataProvider } } = config
        const provider = new ethers.providers.StaticJsonRpcProvider(publicJsonRPCUrl, chainId)
        // const uiPoolDataProviderAddress = '0x6062ad399E47BF75AEa0b3c5BE7077c1E8664Dcb'
        this._contract = new ethers.Contract(uiPoolDataProvider, _abi, provider);
    }
  //   {
  //     "id": "0xb597cd8d3217ea6477232f9217fa70837ff667af0x88757f2f99175387ab4c6a4b3067c77a695b0349",
  //     "underlyingAsset": "0xb597cd8d3217ea6477232f9217fa70837ff667af",
  //     "name": "",
  //     "symbol": "AAVE",
  //     "decimals": 18,
  //     "baseLTVasCollateral": "5000",
  //     "reserveLiquidationThreshold": "6500",
  //     "reserveLiquidationBonus": "11000",
  //     "reserveFactor": "0",
  //     "usageAsCollateralEnabled": true,
  //     "borrowingEnabled": true,
  //     "stableBorrowRateEnabled": false,
  //     "isActive": true,
  //     "isFrozen": false,
  //     "liquidityIndex": "1000140732833692901619263410",
  //     "variableBorrowIndex": "1000000000000000000000000000",
  //     "liquidityRate": "0",
  //     "variableBorrowRate": "0",
  //     "stableBorrowRate": "0",
  //     "lastUpdateTimestamp": 1645135108,
  //     "aTokenAddress": "0x6d93ef8093F067f19d33C2360cE17b20a8c45CD7",
  //     "stableDebtTokenAddress": "0x72d2Aea8aCcD3277D90093a974eFf3e1945871D7",
  //     "variableDebtTokenAddress": "0x5aF7bAC415D9c249176ea233E92646E5c9288b92",
  //     "interestRateStrategyAddress": "0x44d62681B1Bd456534a22c7F931893D93A20307f",
  //     "availableLiquidity": "5920487007247787003",
  //     "totalPrincipalStableDebt": "0",
  //     "averageStableRate": "0",
  //     "stableDebtLastUpdateTimestamp": 1636430292,
  //     "totalScaledVariableDebt": "1772912038824159636434",
  //     "priceInMarketReferenceCurrency": "150748780000000000",
  //     "variableRateSlope1": "0",
  //     "variableRateSlope2": "0",
  //     "stableRateSlope1": "0",
  //     "stableRateSlope2": "0"
  // }
    public async getData() {
        const  { lendingPoolAddressProvider } = config
        const { 0: reservesRaw, 1: poolBaseCurrencyRaw } = await this._contract.getReservesData(lendingPoolAddressProvider);
        const reservesData = reservesRaw.map(
            (reserveRaw: any) => ({
              id: (
                reserveRaw.underlyingAsset + lendingPoolAddressProvider
              ).toLowerCase(),
              underlyingAsset: reserveRaw.underlyingAsset.toLowerCase(),
              name: reserveRaw.name,
              symbol: ammSymbolMap[reserveRaw.underlyingAsset.toLowerCase()]
                ? ammSymbolMap[reserveRaw.underlyingAsset.toLowerCase()]
                : reserveRaw.symbol,
              decimals: reserveRaw.decimals.toNumber(),
              baseLTVasCollateral: reserveRaw.baseLTVasCollateral.toString(),
              reserveLiquidationThreshold:
                reserveRaw.reserveLiquidationThreshold.toString(),
              reserveLiquidationBonus: reserveRaw.reserveLiquidationBonus.toString(),
              reserveFactor: reserveRaw.reserveFactor.toString(),
              usageAsCollateralEnabled: reserveRaw.usageAsCollateralEnabled,
              borrowingEnabled: reserveRaw.borrowingEnabled,
              stableBorrowRateEnabled: reserveRaw.stableBorrowRateEnabled,
              isActive: reserveRaw.isActive,
              isFrozen: reserveRaw.isFrozen,
              liquidityIndex: reserveRaw.liquidityIndex.toString(),
              variableBorrowIndex: reserveRaw.variableBorrowIndex.toString(),
              liquidityRate: reserveRaw.liquidityRate.toString(),
              variableBorrowRate: reserveRaw.variableBorrowRate.toString(),
              stableBorrowRate: reserveRaw.stableBorrowRate.toString(),
              lastUpdateTimestamp: reserveRaw.lastUpdateTimestamp,
              aTokenAddress: reserveRaw.aTokenAddress.toString(),
              stableDebtTokenAddress: reserveRaw.stableDebtTokenAddress.toString(),
              variableDebtTokenAddress:
                reserveRaw.variableDebtTokenAddress.toString(),
              interestRateStrategyAddress:
                reserveRaw.interestRateStrategyAddress.toString(),
              availableLiquidity: reserveRaw.availableLiquidity.toString(),
              totalPrincipalStableDebt:
                reserveRaw.totalPrincipalStableDebt.toString(),
              averageStableRate: reserveRaw.averageStableRate.toString(),
              stableDebtLastUpdateTimestamp:
                reserveRaw.stableDebtLastUpdateTimestamp.toNumber(),
              totalScaledVariableDebt: reserveRaw.totalScaledVariableDebt.toString(),
              priceInMarketReferenceCurrency:
                reserveRaw.priceInMarketReferenceCurrency.toString(),
              variableRateSlope1: reserveRaw.variableRateSlope1.toString(),
              variableRateSlope2: reserveRaw.variableRateSlope2.toString(),
              stableRateSlope1: reserveRaw.stableRateSlope1.toString(),
              stableRateSlope2: reserveRaw.stableRateSlope2.toString(),
            }),
        );
    
        const baseCurrencyData = {
          // this is to get the decimals from the unit so 1e18 = string length of 19 - 1 to get the number of 0
          marketReferenceCurrencyDecimals:
            poolBaseCurrencyRaw.marketReferenceCurrencyUnit.toString().length - 1,
          marketReferenceCurrencyPriceInUsd:
            poolBaseCurrencyRaw.marketReferenceCurrencyPriceInUsd.toString(),
          networkBaseTokenPriceInUsd:
            poolBaseCurrencyRaw.networkBaseTokenPriceInUsd.toString(),
          networkBaseTokenPriceDecimals:
            poolBaseCurrencyRaw.networkBaseTokenPriceDecimals,
        };
    
        return {
          reservesData,
          baseCurrencyData,
        };
    }
}