import { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Row, Col, Card, Button, Image } from 'antd';
import { history, useModel } from 'umi';
import { valueToBigNumber } from '@aave/protocol-js';

// import { Pool } from "@/lib/pool";


import styles from './style.less';


export default () => {
  const { reserves, getReserves } = useModel('pool')
  
  let totalLockedInUsd = valueToBigNumber('0');
  let marketRefPriceInUsd = '0'
  if(reserves?.reservesData){
    let list = reserves.reservesData
    .filter((res: any) => res.isActive && !res.isFrozen)
    .map((reserve: any) => {
      totalLockedInUsd = totalLockedInUsd.plus(
        valueToBigNumber(reserve.totalLiquidity)
          .multipliedBy(reserve.priceInMarketReferenceCurrency)
          .multipliedBy(marketRefPriceInUsd)
      );

      const totalLiquidity = Number(reserve.totalLiquidity);
      const totalLiquidityInUSD = valueToBigNumber(reserve.totalLiquidity)
        .multipliedBy(reserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd)
        .toNumber();

      const totalBorrows = Number(reserve.totalDebt);
      const totalBorrowsInUSD = valueToBigNumber(reserve.totalDebt)
        .multipliedBy(reserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd)
        .toNumber();
      // const reserveIncentiveData = reserveIncentives[reserve.underlyingAsset.toLowerCase()];
      const reserveIncentiveData = false
      return {
        totalLiquidity,
        totalLiquidityInUSD,
        totalBorrows: reserve.borrowingEnabled ? totalBorrows : -1,
        totalBorrowsInUSD: reserve.borrowingEnabled ? totalBorrowsInUSD : -1,
        id: reserve.id,
        underlyingAsset: reserve.underlyingAsset,
        currencySymbol: reserve.symbol,
        depositAPY: reserve.borrowingEnabled ? Number(reserve.supplyAPY) : -1,
        avg30DaysLiquidityRate: Number(reserve.avg30DaysLiquidityRate),
        stableBorrowRate:
          reserve.stableBorrowRateEnabled && reserve.borrowingEnabled
            ? Number(reserve.stableBorrowAPY)
            : -1,
        variableBorrowRate: reserve.borrowingEnabled ? Number(reserve.variableBorrowAPY) : -1,
        avg30DaysVariableRate: Number(reserve.avg30DaysVariableBorrowRate),
        borrowingEnabled: reserve.borrowingEnabled,
        stableBorrowRateEnabled: reserve.stableBorrowRateEnabled,
        isFreezed: reserve.isFrozen,
        aincentivesAPR: reserveIncentiveData ? reserveIncentiveData.aIncentives.incentiveAPR : '0',
        vincentivesAPR: reserveIncentiveData ? reserveIncentiveData.vIncentives.incentiveAPR : '0',
        sincentivesAPR: reserveIncentiveData ? reserveIncentiveData.sIncentives.incentiveAPR : '0',
      };
    });
    console.log('reserves:', list, reserves)
  }

  // const pool = new Pool();
  const loadData = async () => {
    await getReserves()
  }


  useEffect(() => {
    // loadData()
  },[])

  const handler = {
    detail(record: any) {
      history.push('/market/detail/' + record.key);
    }
  };

  const columns = [
    {
      title: 'Assets',
      dataIndex: 'symbol',
    },
    {
      title: 'Market Size',
      dataIndex: 'totalScaledVariableDebt',
      sorter: {
        compare: (a, b) => a.chinese - b.chinese,
        multiple: 3,
      },
    },
    {
      title: 'total borrowings',
      dataIndex: 'totalPrincipalStableDebt',
      sorter: {
        compare: (a, b) => a.math - b.math,
        multiple: 2,
      },
    },
    {
      title: 'deposit APY  (annual rate of return)',
      dataIndex: 'liquidityRate',
      sorter: {
        compare: (a, b) => a.english - b.english,
        multiple: 1,
      },
    },
    {
      title: 'annual interest rate of borrowing',
      dataIndex: 'variableBorrowRate',
      sorter: {
        compare: (a, b) => a.english - b.english,
        multiple: 1,
      },
    },
  ];

  const data = [
    {
        "id": "0xb597cd8d3217ea6477232f9217fa70837ff667af0x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0xb597cd8d3217ea6477232f9217fa70837ff667af",
        "name": "",
        "symbol": "AAVE",
        "decimals": 18,
        "baseLTVasCollateral": "5000",
        "reserveLiquidationThreshold": "6500",
        "reserveLiquidationBonus": "11000",
        "reserveFactor": "0",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": false,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1000140732833692901619263410",
        "variableBorrowIndex": "1000000000000000000000000000",
        "liquidityRate": "0",
        "variableBorrowRate": "0",
        "stableBorrowRate": "0",
        "lastUpdateTimestamp": 1645228380,
        "aTokenAddress": "0x6d93ef8093F067f19d33C2360cE17b20a8c45CD7",
        "stableDebtTokenAddress": "0x72d2Aea8aCcD3277D90093a974eFf3e1945871D7",
        "variableDebtTokenAddress": "0x5aF7bAC415D9c249176ea233E92646E5c9288b92",
        "interestRateStrategyAddress": "0x44d62681B1Bd456534a22c7F931893D93A20307f",
        "availableLiquidity": "0",
        "totalPrincipalStableDebt": "0",
        "averageStableRate": "0",
        "stableDebtLastUpdateTimestamp": 1636430292,
        "totalScaledVariableDebt": "1779282525831407423437",
        "priceInMarketReferenceCurrency": "150748780000000000",
        "variableRateSlope1": "0",
        "variableRateSlope2": "0",
        "stableRateSlope1": "0",
        "stableRateSlope2": "0"
    },
    {
        "id": "0x2d12186fbb9f9a8c28b3ffdd4c42920f8539d7380x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0x2d12186fbb9f9a8c28b3ffdd4c42920f8539d738",
        "name": "",
        "symbol": "BAT",
        "decimals": 18,
        "baseLTVasCollateral": "7000",
        "reserveLiquidationThreshold": "7500",
        "reserveLiquidationBonus": "11000",
        "reserveFactor": "2000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1214911447645510170782967517",
        "variableBorrowIndex": "1518684032103926126947230554",
        "liquidityRate": "432549324422483787794517503",
        "variableBorrowRate": "928931319794727104371627615",
        "stableBorrowRate": "958931319794727104371627615",
        "lastUpdateTimestamp": 1645200184,
        "aTokenAddress": "0x28f92b4c8Bdab37AF6C4422927158560b4bB446e",
        "stableDebtTokenAddress": "0x07a0B32983ab8203E8C3493F0AbE5bFe784fAa15",
        "variableDebtTokenAddress": "0xcE271C229576605bdabD0A3D664685cbC383f3a6",
        "interestRateStrategyAddress": "0xBe13180555b24991b905808dCbb6EBEd4a5F3928",
        "availableLiquidity": "113245468072305048471018947",
        "totalPrincipalStableDebt": "14241672653254039788572636",
        "averageStableRate": "451227665839686242390372152",
        "stableDebtLastUpdateTimestamp": 1645109912,
        "totalScaledVariableDebt": "106010485815555574401093878",
        "priceInMarketReferenceCurrency": "269800000000000",
        "variableRateSlope1": "70000000000000000000000000",
        "variableRateSlope2": "3000000000000000000000000000",
        "stableRateSlope1": "100000000000000000000000000",
        "stableRateSlope2": "3000000000000000000000000000"
    },
    {
        "id": "0x4c6e1efc12fdfd568186b7baec0a43fffb4bcccf0x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0x4c6e1efc12fdfd568186b7baec0a43fffb4bcccf",
        "name": "",
        "symbol": "BUSD",
        "decimals": 18,
        "baseLTVasCollateral": "0",
        "reserveLiquidationThreshold": "0",
        "reserveLiquidationBonus": "0",
        "reserveFactor": "1000",
        "usageAsCollateralEnabled": false,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": false,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1006635264253252305229484794",
        "variableBorrowIndex": "1017845828476056164157494196",
        "liquidityRate": "13286715732551237402215435",
        "variableBorrowRate": "27168932147411025917269570",
        "stableBorrowRate": "0",
        "lastUpdateTimestamp": 1645235060,
        "aTokenAddress": "0xfe3E41Db9071458e39104711eF1Fa668bae44e85",
        "stableDebtTokenAddress": "0x597c5d0390E7e995d36F2e49F9eD979697723bE9",
        "variableDebtTokenAddress": "0xB85eCAd7a9C9F09749CeCF84122189A7908eC934",
        "interestRateStrategyAddress": "0x2f84F2B9a45d178646018112d520Af68E97AcA5D",
        "availableLiquidity": "1830201165963638939403904",
        "totalPrincipalStableDebt": "0",
        "averageStableRate": "0",
        "stableDebtLastUpdateTimestamp": 1644385040,
        "totalScaledVariableDebt": "2139750670003082751461119",
        "priceInMarketReferenceCurrency": "355346141491300",
        "variableRateSlope1": "40000000000000000000000000",
        "variableRateSlope2": "1000000000000000000000000000",
        "stableRateSlope1": "0",
        "stableRateSlope2": "0"
    },
    {
        "id": "0xff795577d9ac8bd7d90ee22b6c1703490b6512fd0x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0xff795577d9ac8bd7d90ee22b6c1703490b6512fd",
        "name": "",
        "symbol": "DAI",
        "decimals": 18,
        "baseLTVasCollateral": "7500",
        "reserveLiquidationThreshold": "8000",
        "reserveLiquidationBonus": "10500",
        "reserveFactor": "1000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1151626874300366227001297699",
        "variableBorrowIndex": "1193475587226497868726763533",
        "liquidityRate": "762047241091405808530",
        "variableBorrowRate": "205756842058658685650653",
        "stableBorrowRate": "39102878421029329342825326",
        "lastUpdateTimestamp": 1645232092,
        "aTokenAddress": "0xdCf0aF9e59C002FA3AA091a46196b37530FD48a8",
        "stableDebtTokenAddress": "0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3",
        "variableDebtTokenAddress": "0xEAbBDBe7aaD7d5A278da40967E62C8c8Fe5fAec8",
        "interestRateStrategyAddress": "0x1c4c4dD7F19738Fd7C21Fa7CbF9667710ff3Ba4c",
        "availableLiquidity": "99683234449616451197213975328769149792",
        "totalPrincipalStableDebt": "588310326176899434361926348",
        "averageStableRate": "271696372312645076149991901",
        "stableDebtLastUpdateTimestamp": 1645232092,
        "totalScaledVariableDebt": "345130810048805030098080483188754816",
        "priceInMarketReferenceCurrency": "353920000000000",
        "variableRateSlope1": "40000000000000000000000000",
        "variableRateSlope2": "750000000000000000000000000",
        "stableRateSlope1": "20000000000000000000000000",
        "stableRateSlope2": "750000000000000000000000000"
    },
    {
        "id": "0xc64f90cd7b564d3ab580eb20a102a8238e218be20x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0xc64f90cd7b564d3ab580eb20a102a8238e218be2",
        "name": "",
        "symbol": "ENJ",
        "decimals": 18,
        "baseLTVasCollateral": "5500",
        "reserveLiquidationThreshold": "6000",
        "reserveLiquidationBonus": "11000",
        "reserveFactor": "2000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "2557726161662608133201164778",
        "variableBorrowIndex": "3586655694672123391978449616",
        "liquidityRate": "1831589325760743611078731953",
        "variableBorrowRate": "2395372635209973084240527935",
        "stableBorrowRate": "2425372635209973084240527935",
        "lastUpdateTimestamp": 1645180080,
        "aTokenAddress": "0x1d1F2Cb9ED46A8d5bf0254E5CE400514D62d55F0",
        "stableDebtTokenAddress": "0x8af08B5874380E1F1816e30bE12d773f4EB70e67",
        "variableDebtTokenAddress": "0xc11e09B03634144a1862E14ef7569DbEb4b7F3a2",
        "interestRateStrategyAddress": "0xa3D38901f947431f698976B734C77399d1f8dAd6",
        "availableLiquidity": "92106545921205013499922",
        "totalPrincipalStableDebt": "268802263523530176274593",
        "averageStableRate": "2914158461459025031454632836",
        "stableDebtLastUpdateTimestamp": 1645001164,
        "totalScaledVariableDebt": "105757722674977223909043",
        "priceInMarketReferenceCurrency": "598512247597944",
        "variableRateSlope1": "70000000000000000000000000",
        "variableRateSlope2": "3000000000000000000000000000",
        "stableRateSlope1": "100000000000000000000000000",
        "stableRateSlope2": "3000000000000000000000000000"
    },
    {
        "id": "0x3f80c39c0b96a0945f9f0e9f55d8a8891c5671a80x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0x3f80c39c0b96a0945f9f0e9f55d8a8891c5671a8",
        "name": "",
        "symbol": "KNC",
        "decimals": 18,
        "baseLTVasCollateral": "6000",
        "reserveLiquidationThreshold": "6500",
        "reserveLiquidationBonus": "11000",
        "reserveFactor": "2000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1013929985315789358807448701",
        "variableBorrowIndex": "1034821513404393896717231497",
        "liquidityRate": "7878466665681319231553292",
        "variableBorrowRate": "33343210372889600644703605",
        "stableBorrowRate": "41679012966112000805879506",
        "lastUpdateTimestamp": 1644654096,
        "aTokenAddress": "0xdDdEC78e29f3b579402C42ca1fd633DE00D23940",
        "stableDebtTokenAddress": "0x7f4E5bA1eE5dCAa4440371ec521cBc130De12E5e",
        "variableDebtTokenAddress": "0x196d717b2D8a5694572C2742343C333EA27B8288",
        "interestRateStrategyAddress": "0xD1441fFA68fc5007a5a9E68C61d45b5474792DE9",
        "availableLiquidity": "1176381745914306100556585",
        "totalPrincipalStableDebt": "18499950385518836025940",
        "averageStableRate": "103848366935497610238547110",
        "stableDebtLastUpdateTimestamp": 1642198880,
        "totalScaledVariableDebt": "404387844290633449498884",
        "priceInMarketReferenceCurrency": "752630000000000",
        "variableRateSlope1": "80000000000000000000000000",
        "variableRateSlope2": "3000000000000000000000000000",
        "stableRateSlope1": "100000000000000000000000000",
        "stableRateSlope2": "3000000000000000000000000000"
    },
    {
        "id": "0xad5ce863ae3e4e9394ab43d4ba0d80f419f617890x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
        "name": "",
        "symbol": "LINK",
        "decimals": 18,
        "baseLTVasCollateral": "7000",
        "reserveLiquidationThreshold": "7500",
        "reserveLiquidationBonus": "11000",
        "reserveFactor": "2000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1044496399709985507774532607",
        "variableBorrowIndex": "1070151132497056246182696291",
        "liquidityRate": "9380542977220815539152046",
        "variableBorrowRate": "25771135776543259386893187",
        "stableBorrowRate": "36815908252204656266990266",
        "lastUpdateTimestamp": 1645213052,
        "aTokenAddress": "0xeD9044cA8F7caCe8eACcD40367cF2bee39eD1b04",
        "stableDebtTokenAddress": "0x0DBEE55AB73e3C14421d3f437a218ea99A520556",
        "variableDebtTokenAddress": "0xcCead10A3BA54b1FA6D107b63B7D5e5e2f9888D8",
        "interestRateStrategyAddress": "0x769c5864E54694b0aBB77C878969D539715FE397",
        "availableLiquidity": "1772150898152022702409185",
        "totalPrincipalStableDebt": "44573071117449041805499",
        "averageStableRate": "380259180502213699871822833",
        "stableDebtLastUpdateTimestamp": 1645021480,
        "totalScaledVariableDebt": "287078811428710433475712",
        "priceInMarketReferenceCurrency": "5435249057679261",
        "variableRateSlope1": "70000000000000000000000000",
        "variableRateSlope2": "3000000000000000000000000000",
        "stableRateSlope1": "100000000000000000000000000",
        "stableRateSlope2": "3000000000000000000000000000"
    },
    {
        "id": "0x738dc6380157429e957d223e6333dc385c85fec70x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0x738dc6380157429e957d223e6333dc385c85fec7",
        "name": "",
        "symbol": "MANA",
        "decimals": 18,
        "baseLTVasCollateral": "6000",
        "reserveLiquidationThreshold": "6500",
        "reserveLiquidationBonus": "11000",
        "reserveFactor": "3500",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1003282239194402529323400858",
        "variableBorrowIndex": "1013730371598784314335402443",
        "liquidityRate": "7741122968090637538078",
        "variableBorrowRate": "1351503845333413797424809",
        "stableBorrowRate": "1930719779047733996321154",
        "lastUpdateTimestamp": 1645221552,
        "aTokenAddress": "0xA288B1767C91Aa9d8A14a65dC6B2E7ce68c02DFd",
        "stableDebtTokenAddress": "0xd4aEcF57cbcfeA373565DE75537aAc911EAF1759",
        "variableDebtTokenAddress": "0xaEE5AA094B55b6538388A4E8CBAe9E81Bfe815e6",
        "interestRateStrategyAddress": "0x72e698711B51DC0B139ff4126C115a760da12649",
        "availableLiquidity": "39696591899292867568015877",
        "totalPrincipalStableDebt": "11312453705966330773710",
        "averageStableRate": "1943466682202645183822017",
        "stableDebtLastUpdateTimestamp": 1644853240,
        "totalScaledVariableDebt": "332044453522148476089391",
        "priceInMarketReferenceCurrency": "1064250000000000",
        "variableRateSlope1": "70000000000000000000000000",
        "variableRateSlope2": "3000000000000000000000000000",
        "stableRateSlope1": "100000000000000000000000000",
        "stableRateSlope2": "3000000000000000000000000000"
    },
    {
        "id": "0x61e4cae3da7fd189e52a4879c7b8067d7c2cc0fa0x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0x61e4cae3da7fd189e52a4879c7b8067d7c2cc0fa",
        "name": "",
        "symbol": "MKR",
        "decimals": 18,
        "baseLTVasCollateral": "6000",
        "reserveLiquidationThreshold": "6500",
        "reserveLiquidationBonus": "11000",
        "reserveFactor": "2000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1129909474034995989518687357",
        "variableBorrowIndex": "1305669590886412718461362748",
        "liquidityRate": "484291204330413180340712594",
        "variableBorrowRate": "990151849313862907327601533",
        "stableBorrowRate": "1020151849313862907327601533",
        "lastUpdateTimestamp": 1645096688,
        "aTokenAddress": "0x9d9DaBEae6BcBa881404A9e499B13B2B3C1F329E",
        "stableDebtTokenAddress": "0xC37AadA7758e10a49bdECb9078753d5D096A4649",
        "variableDebtTokenAddress": "0xB86a93aA1325e4F58E3dbA7CE9DA251D83374fA2",
        "interestRateStrategyAddress": "0x542E4f6dd0BC120329aeB718a4a2aa511e60a06B",
        "availableLiquidity": "5017150968361195157396",
        "totalPrincipalStableDebt": "302152066302410290608",
        "averageStableRate": "675706151535527312839838856",
        "stableDebtLastUpdateTimestamp": 1644989044,
        "totalScaledVariableDebt": "6002915538150342162957",
        "priceInMarketReferenceCurrency": "678203896248500000",
        "variableRateSlope1": "70000000000000000000000000",
        "variableRateSlope2": "3000000000000000000000000000",
        "stableRateSlope1": "100000000000000000000000000",
        "stableRateSlope2": "3000000000000000000000000000"
    },
    {
        "id": "0x5eebf65a6746eed38042353ba84c8e37ed58ac6f0x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0x5eebf65a6746eed38042353ba84c8e37ed58ac6f",
        "name": "",
        "symbol": "REN",
        "decimals": 18,
        "baseLTVasCollateral": "5500",
        "reserveLiquidationThreshold": "6000",
        "reserveLiquidationBonus": "11000",
        "reserveFactor": "2000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1382742171773701746174943441",
        "variableBorrowIndex": "1778041771710126023426473667",
        "liquidityRate": "689396009904413770329444262",
        "variableBorrowRate": "1275408772648962950893009480",
        "stableBorrowRate": "1305408772648962950893009480",
        "lastUpdateTimestamp": 1644868916,
        "aTokenAddress": "0x01875ee883B32f5f961A92eC597DcEe2dB7589c1",
        "stableDebtTokenAddress": "0xc66a5fd3Bd3D0329895ceE5755e161FD89c2EecD",
        "variableDebtTokenAddress": "0x75f318b9B40c5bEb0EEAdab5294C4108A376a22d",
        "interestRateStrategyAddress": "0x08e86d494385d439BCf59E408d16A6c87a9cf12A",
        "availableLiquidity": "1614478892244464965773431",
        "totalPrincipalStableDebt": "96300391060469135476175",
        "averageStableRate": "1566042484549699649409671599",
        "stableDebtLastUpdateTimestamp": 1643995464,
        "totalScaledVariableDebt": "1795265660287430158427681",
        "priceInMarketReferenceCurrency": "599420000000000",
        "variableRateSlope1": "70000000000000000000000000",
        "variableRateSlope2": "3000000000000000000000000000",
        "stableRateSlope1": "100000000000000000000000000",
        "stableRateSlope2": "3000000000000000000000000000"
    },
    {
        "id": "0x7fdb81b0b8a010dd4ffc57c3fecbf145ba8bd9470x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0x7fdb81b0b8a010dd4ffc57c3fecbf145ba8bd947",
        "name": "",
        "symbol": "SNX",
        "decimals": 18,
        "baseLTVasCollateral": "1500",
        "reserveLiquidationThreshold": "4000",
        "reserveLiquidationBonus": "11000",
        "reserveFactor": "3500",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": false,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1500073354664204965028431698",
        "variableBorrowIndex": "1940558683155227397671619107",
        "liquidityRate": "715473986683750402008296900",
        "variableBorrowRate": "1109678218398076436659145915",
        "stableBorrowRate": "0",
        "lastUpdateTimestamp": 1645228540,
        "aTokenAddress": "0xAA74AdA92dE4AbC0371b75eeA7b1bd790a69C9e1",
        "stableDebtTokenAddress": "0x14B7a7Ab57190aEc3210303ef1cF29088535B329",
        "variableDebtTokenAddress": "0x7dF2a710751cb9f1FD392107187e4Aed0Ae867b0",
        "interestRateStrategyAddress": "0x1d9F400B820660Be36cB250DFF5a61d8645e1c06",
        "availableLiquidity": "534063840026203428124",
        "totalPrincipalStableDebt": "10000000000000000",
        "averageStableRate": "0",
        "stableDebtLastUpdateTimestamp": 1634560552,
        "totalScaledVariableDebt": "33851671289617537014821",
        "priceInMarketReferenceCurrency": "1569710000000000",
        "variableRateSlope1": "120000000000000000000000000",
        "variableRateSlope2": "1000000000000000000000000000",
        "stableRateSlope1": "0",
        "stableRateSlope2": "0"
    },
    {
        "id": "0x99b267b9d96616f906d53c26decf3c56724012820x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0x99b267b9d96616f906d53c26decf3c5672401282",
        "name": "",
        "symbol": "sUSD",
        "decimals": 18,
        "baseLTVasCollateral": "0",
        "reserveLiquidationThreshold": "0",
        "reserveLiquidationBonus": "0",
        "reserveFactor": "2000",
        "usageAsCollateralEnabled": false,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": false,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1495621324279189798970345269",
        "variableBorrowIndex": "1689590614552228424880535232",
        "liquidityRate": "830434096382131268767542255",
        "variableBorrowRate": "1040000000000000000000000000",
        "stableBorrowRate": "0",
        "lastUpdateTimestamp": 1642559920,
        "aTokenAddress": "0x9488fF6F29ff75bfdF8cd5a95C6aa679bc7Cd65c",
        "stableDebtTokenAddress": "0xB155258d3c18dd5D41e8838c8b45CaE1B17a11D9",
        "variableDebtTokenAddress": "0xf3B942441Bd9d335E64413BeA6b76a49A5853C54",
        "interestRateStrategyAddress": "0xD1b70bece456F166f696309A280C5e18cBC4c70A",
        "availableLiquidity": "0",
        "totalPrincipalStableDebt": "1000000000000000000000",
        "averageStableRate": "0",
        "stableDebtLastUpdateTimestamp": 1636526312,
        "totalScaledVariableDebt": "313876395373960573157553",
        "priceInMarketReferenceCurrency": "346071489824800",
        "variableRateSlope1": "40000000000000000000000000",
        "variableRateSlope2": "1000000000000000000000000000",
        "stableRateSlope1": "0",
        "stableRateSlope2": "0"
    },
    {
        "id": "0x016750ac630f711882812f24dba6c95b9d35856d0x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0x016750ac630f711882812f24dba6c95b9d35856d",
        "name": "",
        "symbol": "TUSD",
        "decimals": 18,
        "baseLTVasCollateral": "7500",
        "reserveLiquidationThreshold": "8000",
        "reserveLiquidationBonus": "10500",
        "reserveFactor": "1000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1145394045009788607187495908",
        "variableBorrowIndex": "1215369091056745993702913355",
        "liquidityRate": "27140450123747026579357368",
        "variableBorrowRate": "37276330605582858741498679",
        "stableBorrowRate": "18638165302791429370749339",
        "lastUpdateTimestamp": 1645133896,
        "aTokenAddress": "0x39914AdBe5fDbC2b9ADeedE8Bcd444b20B039204",
        "stableDebtTokenAddress": "0x082576C4CfC2eE1e0b8088B84d50CEb97CD84E49",
        "variableDebtTokenAddress": "0xC0cFab5E4A9D8DA2Bc98D0a2b3f9dc20f7eec19C",
        "interestRateStrategyAddress": "0x23F67B51FDeC3C2eea87825d4fD7148288623A50",
        "availableLiquidity": "738864713164289800112525",
        "totalPrincipalStableDebt": "272230977186783506769825",
        "averageStableRate": "62506422813315136352383181",
        "stableDebtLastUpdateTimestamp": 1645133896,
        "totalScaledVariableDebt": "1557065390840390472211702",
        "priceInMarketReferenceCurrency": "354030000000000",
        "variableRateSlope1": "40000000000000000000000000",
        "variableRateSlope2": "750000000000000000000000000",
        "stableRateSlope1": "20000000000000000000000000",
        "stableRateSlope2": "750000000000000000000000000"
    },
    {
        "id": "0xe22da380ee6b445bb8273c81944adeb6e84504220x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0xe22da380ee6b445bb8273c81944adeb6e8450422",
        "name": "",
        "symbol": "USDC",
        "decimals": 6,
        "baseLTVasCollateral": "8000",
        "reserveLiquidationThreshold": "8500",
        "reserveLiquidationBonus": "10500",
        "reserveFactor": "1000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1009019003684174063954798465",
        "variableBorrowIndex": "1012295691002599974819227856",
        "liquidityRate": "157697355100537808955467",
        "variableBorrowRate": "2790613500406526196440246",
        "stableBorrowRate": "40395306750203263098220123",
        "lastUpdateTimestamp": 1645231968,
        "aTokenAddress": "0xe12AFeC5aa12Cf614678f9bFeeB98cA9Bb95b5B0",
        "stableDebtTokenAddress": "0x252C017036b144A812b53BC122d0E67cBB451aD4",
        "variableDebtTokenAddress": "0xBE9B058a0f2840130372a81eBb3181dcE02BE957",
        "interestRateStrategyAddress": "0x97d50ee3048bA5FBa2CAC5b68ab158B7bB1094Be",
        "availableLiquidity": "9080024055356135067613440006",
        "totalPrincipalStableDebt": "69510087580086",
        "averageStableRate": "57259323992041420449835728",
        "stableDebtLastUpdateTimestamp": 1645223440,
        "totalScaledVariableDebt": "600930644875633720507284257",
        "priceInMarketReferenceCurrency": "354465410000000",
        "variableRateSlope1": "40000000000000000000000000",
        "variableRateSlope2": "600000000000000000000000000",
        "stableRateSlope1": "20000000000000000000000000",
        "stableRateSlope2": "600000000000000000000000000"
    },
    {
        "id": "0x13512979ade267ab5100878e2e0f485b568328a40x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0x13512979ade267ab5100878e2e0f485b568328a4",
        "name": "",
        "symbol": "USDT",
        "decimals": 6,
        "baseLTVasCollateral": "8000",
        "reserveLiquidationThreshold": "8500",
        "reserveLiquidationBonus": "10500",
        "reserveFactor": "1000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1000680737603270490911450046",
        "variableBorrowIndex": "1001742733058104356009975181",
        "liquidityRate": "31854",
        "variableBorrowRate": "270949696897",
        "stableBorrowRate": "35000000000000135474848448",
        "lastUpdateTimestamp": 1645228188,
        "aTokenAddress": "0xFF3c8bc103682FA918c954E84F5056aB4DD5189d",
        "stableDebtTokenAddress": "0xf3DCeaDf668607bFCF565E84d9644c42eea518cd",
        "variableDebtTokenAddress": "0xa6EfAF3B1C6c8E2be44818dB64E4DEC7416983a1",
        "interestRateStrategyAddress": "0xa36D9b59b65aEE729fcBb1b3cD51D2a718751076",
        "availableLiquidity": "117749078474608634471719504486344928",
        "totalPrincipalStableDebt": "119048992529801",
        "averageStableRate": "35006695460374084515141041",
        "stableDebtLastUpdateTimestamp": 1645228188,
        "totalScaledVariableDebt": "716592786270426501695",
        "priceInMarketReferenceCurrency": "354300000000000",
        "variableRateSlope1": "40000000000000000000000000",
        "variableRateSlope2": "600000000000000000000000000",
        "stableRateSlope1": "20000000000000000000000000",
        "stableRateSlope2": "600000000000000000000000000"
    },
    {
        "id": "0xd1b98b6607330172f1d991521145a22bce7932770x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0xd1b98b6607330172f1d991521145a22bce793277",
        "name": "",
        "symbol": "WBTC",
        "decimals": 8,
        "baseLTVasCollateral": "7000",
        "reserveLiquidationThreshold": "7500",
        "reserveLiquidationBonus": "11000",
        "reserveFactor": "2000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1062719311562685492240502452",
        "variableBorrowIndex": "1092276971664127621327242035",
        "liquidityRate": "4394872822382984",
        "variableBorrowRate": "76996063545800460",
        "stableBorrowRate": "30000000096245079432250576",
        "lastUpdateTimestamp": 1645147644,
        "aTokenAddress": "0x62538022242513971478fcC7Fb27ae304AB5C29F",
        "stableDebtTokenAddress": "0x45b85733E2609B9Eb18DbF1315765ddB8431e0B6",
        "variableDebtTokenAddress": "0x9b8107B86A3cD6c8d766B30d3aDD046348bf8dB4",
        "interestRateStrategyAddress": "0x62aBC6E0e599D416aC553Bc912C253A1F5cb6729",
        "availableLiquidity": "1000000039767075352660",
        "totalPrincipalStableDebt": "170161489420",
        "averageStableRate": "32280390406744088770682318",
        "stableDebtLastUpdateTimestamp": 1645021036,
        "totalScaledVariableDebt": "416935914798",
        "priceInMarketReferenceCurrency": "14236769512421000000",
        "variableRateSlope1": "80000000000000000000000000",
        "variableRateSlope2": "3000000000000000000000000000",
        "stableRateSlope1": "100000000000000000000000000",
        "stableRateSlope2": "3000000000000000000000000000"
    },
    {
        "id": "0xd0a1e359811322d97991e03f863a0c30c2cf029c0x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
        "name": "",
        "symbol": "WETH",
        "decimals": 18,
        "baseLTVasCollateral": "8000",
        "reserveLiquidationThreshold": "8250",
        "reserveLiquidationBonus": "10500",
        "reserveFactor": "1000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "3142302466791813219201955788",
        "variableBorrowIndex": "3604340791881410999825854153",
        "liquidityRate": "971922258681205146877081596",
        "variableBorrowRate": "1079641536759687358372685691",
        "stableBorrowRate": "1129641536759687358372685691",
        "lastUpdateTimestamp": 1645234796,
        "aTokenAddress": "0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347",
        "stableDebtTokenAddress": "0x1F85D0dc45332D00aead98D26db0735350F80D18",
        "variableDebtTokenAddress": "0xDD13CE9DE795E7faCB6fEC90E346C7F3abe342E2",
        "interestRateStrategyAddress": "0x5Bb4C8731E0Cc7fB854A3B3ED21B466b757cdfA7",
        "availableLiquidity": "2452190049989265819",
        "totalPrincipalStableDebt": "1602222449539420628943",
        "averageStableRate": "1084600964180748274605286138",
        "stableDebtLastUpdateTimestamp": 1645164140,
        "totalScaledVariableDebt": "4976412707558954488977",
        "priceInMarketReferenceCurrency": "1000000000000000000",
        "variableRateSlope1": "80000000000000000000000000",
        "variableRateSlope2": "1000000000000000000000000000",
        "stableRateSlope1": "100000000000000000000000000",
        "stableRateSlope2": "1000000000000000000000000000"
    },
    {
        "id": "0xb7c325266ec274feb1354021d27fa3e3379d840d0x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0xb7c325266ec274feb1354021d27fa3e3379d840d",
        "name": "",
        "symbol": "YFI",
        "decimals": 18,
        "baseLTVasCollateral": "4000",
        "reserveLiquidationThreshold": "5500",
        "reserveLiquidationBonus": "11500",
        "reserveFactor": "2000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "2426095396955231293603248518",
        "variableBorrowIndex": "4105335909224025767948007400",
        "liquidityRate": "271522841833538748299600351",
        "variableBorrowRate": "608354738304995556683953693",
        "stableBorrowRate": "638354738304995556683953693",
        "lastUpdateTimestamp": 1645114320,
        "aTokenAddress": "0xF6c7282943Beac96f6C70252EF35501a6c1148Fe",
        "stableDebtTokenAddress": "0x7417855ed88C62e610e612Be52AeE510703Dff04",
        "variableDebtTokenAddress": "0xfF682fF79FEb2C057eC3Ff1e083eFdC66f9b37FB",
        "interestRateStrategyAddress": "0x981D7755F1A0e7794104fd87515B06791a894895",
        "availableLiquidity": "765147386252290433028",
        "totalPrincipalStableDebt": "21619157360384775767",
        "averageStableRate": "1030923593101068181590560856",
        "stableDebtLastUpdateTimestamp": 1643934284,
        "totalScaledVariableDebt": "221128476720813030155",
        "priceInMarketReferenceCurrency": "19202907105000000000",
        "variableRateSlope1": "70000000000000000000000000",
        "variableRateSlope2": "3000000000000000000000000000",
        "stableRateSlope1": "100000000000000000000000000",
        "stableRateSlope2": "3000000000000000000000000000"
    },
    {
        "id": "0xd0d76886cf8d952ca26177eb7cfdf83bad08c00c0x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0xd0d76886cf8d952ca26177eb7cfdf83bad08c00c",
        "name": "",
        "symbol": "ZRX",
        "decimals": 18,
        "baseLTVasCollateral": "6000",
        "reserveLiquidationThreshold": "6500",
        "reserveLiquidationBonus": "11000",
        "reserveFactor": "2000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": true,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1440129882065926146280305883",
        "variableBorrowIndex": "1633512179809139898562709361",
        "liquidityRate": "785569008743120194062550876",
        "variableBorrowRate": "1202725354011944213057267647",
        "stableBorrowRate": "1232725354011944213057267647",
        "lastUpdateTimestamp": 1645220416,
        "aTokenAddress": "0xf02D7C23948c9178C68f5294748EB778Ab5e5D9c",
        "stableDebtTokenAddress": "0x7488Eb7fce7e31b91eB9cA4158d54D92e4BB03D7",
        "variableDebtTokenAddress": "0x7a1C28e06bcb4b1fF4768BC2CB9cd33b7622cD62",
        "interestRateStrategyAddress": "0xF37A2e40891de0E9fD28088a539565c647954d85",
        "availableLiquidity": "14178872623256366219775422",
        "totalPrincipalStableDebt": "4822467262723795520620055",
        "averageStableRate": "2826155428915362222840695465",
        "stableDebtLastUpdateTimestamp": 1645106008,
        "totalScaledVariableDebt": "13692730587727352749492616",
        "priceInMarketReferenceCurrency": "214150000000000",
        "variableRateSlope1": "70000000000000000000000000",
        "variableRateSlope2": "3000000000000000000000000000",
        "stableRateSlope1": "100000000000000000000000000",
        "stableRateSlope2": "3000000000000000000000000000"
    },
    {
        "id": "0x075a36ba8846c6b6f53644fdd3bf17e5151789dc0x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0x075a36ba8846c6b6f53644fdd3bf17e5151789dc",
        "name": "",
        "symbol": "UNI",
        "decimals": 18,
        "baseLTVasCollateral": "6000",
        "reserveLiquidationThreshold": "6500",
        "reserveLiquidationBonus": "11000",
        "reserveFactor": "2000",
        "usageAsCollateralEnabled": true,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": false,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1000000000000000000000000000",
        "variableBorrowIndex": "1000000000000000000000000000",
        "liquidityRate": "0",
        "variableBorrowRate": "0",
        "stableBorrowRate": "0",
        "lastUpdateTimestamp": 0,
        "aTokenAddress": "0x601FFc9b7309bdb0132a02a569FBd57d6D1740f2",
        "stableDebtTokenAddress": "0x7A43B2653FF42BDE048e3b14fB42028956a7B6b1",
        "variableDebtTokenAddress": "0x10339d6562e8867bB93506572fF8Aea94B2fF656",
        "interestRateStrategyAddress": "0x4Ccf2B08D747ab0bBA99437f876F7E14e46749DE",
        "availableLiquidity": "0",
        "totalPrincipalStableDebt": "0",
        "averageStableRate": "0",
        "stableDebtLastUpdateTimestamp": 0,
        "totalScaledVariableDebt": "0",
        "priceInMarketReferenceCurrency": "20752405000000000",
        "variableRateSlope1": "0",
        "variableRateSlope2": "0",
        "stableRateSlope1": "0",
        "stableRateSlope2": "0"
    },
    {
        "id": "0x3e0437898a5667a4769b1ca5a34aab1ae7e813770x88757f2f99175387ab4c6a4b3067c77a695b0349",
        "underlyingAsset": "0x3e0437898a5667a4769b1ca5a34aab1ae7e81377",
        "name": "",
        "symbol": "AMPL",
        "decimals": 9,
        "baseLTVasCollateral": "0",
        "reserveLiquidationThreshold": "0",
        "reserveLiquidationBonus": "0",
        "reserveFactor": "2000",
        "usageAsCollateralEnabled": false,
        "borrowingEnabled": true,
        "stableBorrowRateEnabled": false,
        "isActive": true,
        "isFrozen": false,
        "liquidityIndex": "1273158361699615717364184050",
        "variableBorrowIndex": "1374655072696338666103062350",
        "liquidityRate": "365048832329614793206070606",
        "variableBorrowRate": "458501505337617413498466686",
        "stableBorrowRate": "0",
        "lastUpdateTimestamp": 1645020948,
        "aTokenAddress": "0xb8a16bbab34FA7A5C09Ec7679EAfb8fEC06897bc",
        "stableDebtTokenAddress": "0x9157d57DC97A7AFFC7b0a78E78fe25e1401B1dCc",
        "variableDebtTokenAddress": "0xb7b7AF565495670713C92B8848fC8A650a968F81",
        "interestRateStrategyAddress": "0x796ec26fc7df8D81BCB5BABF74ccdE0E2B122164",
        "availableLiquidity": "44319885688",
        "totalPrincipalStableDebt": "0",
        "averageStableRate": "0",
        "stableDebtLastUpdateTimestamp": 1645020948,
        "totalScaledVariableDebt": "6800633438229",
        "priceInMarketReferenceCurrency": "339772620789161",
        "variableRateSlope1": "30000000000000000000000000",
        "variableRateSlope2": "450000000000000000000000000",
        "stableRateSlope1": "0",
        "stableRateSlope2": "0"
    }
  ];

  const PageHeaderContent = ({}) => {
    return (
      <div className={styles.pageHeaderContent}>
        <div className={styles.main}>
          <Row>
            <Col span={12}>
              <div className={styles.text}>
                Is an open source and non-custodial liquidity agreement used to earn interest on
                deposits and borrowed assets
              </div>
              <div className={styles.value}>$ 212,452,680.86</div>
              <div>
                <Button type="primary" size="large" style={{ width: 200 }} onClick={loadData}>
                  To trade coins
                </Button>
              </div>
            </Col>
            <Col span={8}>
              <Image width={260} preview={false} src="/homeimg@3x.png" />
            </Col>
          </Row>
        </div>
        <div style={{ margin: 15, marginBottom: -30 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card className={styles.card} bordered={false}>
                <div className={styles.value}>113M</div>
                <div className={styles.title}>Pledge coin</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className={styles.card} bordered={false}>
                <div style={{ color: '#FF5E2C' }} className={styles.value}>
                  $9.54
                </div>
                <div className={styles.title}>Coin price</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className={styles.card} bordered={false}>
                <div style={{ color: '#6464E7' }} className={styles.value}>
                  5.3M
                </div>
                <div className={styles.title}>Fluidity</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className={styles.card} bordered={false}>
                <div style={{ color: '#FF5E2C' }} className={styles.value}>
                  $49.5M
                </div>
                <div className={styles.title}>Market value</div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  return (
    <PageContainer breadcrumb={false} title={false} content={<PageHeaderContent />}>
      <div style={{marginTop: 50}}>
        <Table
          rowKey={'id'}
          columns={columns}
          dataSource={data}
          onRow={(record) => ({ onClick: () => handler.detail(record) })}
          pagination={false}
        />
      </div>      
    </PageContainer>
  );
};
