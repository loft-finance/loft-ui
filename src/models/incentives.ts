import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useModel } from 'umi';

import { calculateAllUserIncentives, calculateAllReserveIncentives, WEI_DECIMALS } from '@aave/math-utils';

import { API_ETH_MOCK_ADDRESS, calculateSupplies } from '@aave/protocol-js';
import { UiIncentiveDataProvider, UserReserveIncentiveDataHumanizedResponse, Denominations } from '@aave/contract-helpers';
import { getProvider, getNetwork } from '@/lib/helpers/provider';

import dayjs from 'dayjs';

// interval in which the rpc data is refreshed
const POOLING_INTERVAL = 30 * 1000;
// decreased interval in case there was a network error for faster recovery
const RECOVER_INTERVAL = 10 * 1000;


export default () => {
    const { current: currentMarket } = useModel('market');
    const { wallet } = useModel('wallet')
    const { reserves: rawReservesWithBase, userReservesBase: rawUserReservesWithBase } = useModel('pool')

    const currentAccount = wallet?.currentAccount || ''
    const lendingPoolAddressProvider = currentMarket.addresses.LENDING_POOL_ADDRESS_PROVIDER

    const [loadingReserveIncentives, setLoadingReserveIncentives] = useState<boolean>(true);
    const [errorReserveIncentives, setErrorReserveIncentives] = useState<boolean>(false);
    const [loadingUserIncentives, setLoadingUserIncentives] = useState<boolean>(true);
    const [errorUserIncentives, setErrorUserIncentives] = useState<boolean>(false);
    const [reserveIncentiveData, setReserveIncentiveData] = useState<any>([]);
    const [userIncentiveData, setUserIncentiveData] = useState<any>([]);

    const loading = loadingReserveIncentives || loadingUserIncentives

    const chainId = currentMarket.chainId
    const networkConfig = getNetwork(chainId);

    // Fetch reserve incentive data and user incentive data only if currentAccount is set
    const fetchData = async (
        currentAccount: string | undefined,
        lendingPoolAddressProvider: string,
        incentiveDataProviderAddress: string
    ) => {
        fetchReserveIncentiveData(lendingPoolAddressProvider, incentiveDataProviderAddress);
        if (currentAccount && currentAccount !== ethers.constants.AddressZero) {
            fetchUserIncentiveData(
                currentAccount,
                lendingPoolAddressProvider,
                incentiveDataProviderAddress
            );
        } else {
            setLoadingUserIncentives(false);
        }
    };

    // Fetch and format reserve incentive data from UiIncentiveDataProvider contract
    const fetchReserveIncentiveData = async (
        lendingPoolAddressProvider: string,
        incentiveDataProviderAddress: string
    ) => {
        const provider = getProvider(chainId);
        const incentiveDataProviderContract = new UiIncentiveDataProvider({
            incentiveDataProviderAddress,
            provider,
        });

        try {
            const rawReserveIncentiveData =
                await incentiveDataProviderContract.getIncentivesDataWithPrice({
                    lendingPoolAddressProvider,
                    quote: networkConfig.usdMarket ? Denominations.usd : Denominations.eth,
                    chainlinkFeedsRegistry: networkConfig.addresses.chainlinkFeedRegistry,
                });

            setReserveIncentiveData(rawReserveIncentiveData);
            setErrorReserveIncentives(false);
        } catch (e) {
            console.log('e', e);
            setErrorReserveIncentives(e.message);
        }
        setLoadingReserveIncentives(false);
    };

    // Fetch and format user incentive data from UiIncentiveDataProvider
    const fetchUserIncentiveData = async (
        currentAccount: string,
        lendingPoolAddressProvider: string,
        incentiveDataProviderAddress: string
    ) => {
        const provider = getProvider(chainId);
        const incentiveDataProviderContract = new UiIncentiveDataProvider({
            incentiveDataProviderAddress,
            provider,
        });

        try {
            const rawUserIncentiveData: UserReserveIncentiveDataHumanizedResponse[] =
                await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized(
                    currentAccount,
                    lendingPoolAddressProvider
                );

            setUserIncentiveData(rawUserIncentiveData);
            setErrorUserIncentives(false);
        } catch (e) {
            console.log('e', e);
            setErrorUserIncentives(e.message);
        }
        setLoadingUserIncentives(false);
    };

    
    const currentTimestamp = dayjs().unix();

    // Create array of formatted user and reserve data used for user incentive calculations
    let computedUserReserves: any = [];
    if (rawUserReservesWithBase) {
        rawUserReservesWithBase?.forEach((userReserve) => {
            const reserve = rawReservesWithBase.find(
                (reserve) =>
                    reserve.underlyingAsset.toLowerCase() ===
                    userReserve.reserve.underlyingAsset.toLowerCase()
            );
            if (reserve) {
                const reserveSupplyData = {
                    totalScaledVariableDebt: reserve.totalScaledVariableDebt,
                    variableBorrowIndex: reserve.variableBorrowIndex,
                    variableBorrowRate: reserve.variableBorrowRate,
                    totalPrincipalStableDebt: reserve.totalPrincipalStableDebt,
                    averageStableRate: reserve.averageStableRate,
                    availableLiquidity: reserve.availableLiquidity,
                    stableDebtLastUpdateTimestamp: reserve.stableDebtLastUpdateTimestamp,
                    lastUpdateTimestamp: reserve.lastUpdateTimestamp,
                };
                const supplies = calculateSupplies(reserveSupplyData, currentTimestamp);
                // Construct UserReserveData object from reserve and userReserve fields
                computedUserReserves.push({
                    underlyingAsset: userReserve.reserve.underlyingAsset.toLowerCase(),
                    totalLiquidity: supplies.totalLiquidity.toString(),
                    liquidityIndex: reserve.liquidityIndex,
                    totalScaledVariableDebt: reserve.totalScaledVariableDebt,
                    totalPrincipalStableDebt: reserve.totalPrincipalStableDebt,
                    scaledATokenBalance: userReserve.scaledATokenBalance,
                    scaledVariableDebt: userReserve.scaledVariableDebt,
                    principalStableDebt: userReserve.principalStableDebt,
                });
            }
        });
    }
    // Create array of formatted reserve data used for reserve incentive calculations
    const computedReserves: any = rawReservesWithBase.map((reserve) => {
        const reserveSupplyData = {
            totalScaledVariableDebt: reserve.totalScaledVariableDebt,
            variableBorrowIndex: reserve.variableBorrowIndex,
            variableBorrowRate: reserve.variableBorrowRate,
            totalPrincipalStableDebt: reserve.totalPrincipalStableDebt,
            averageStableRate: reserve.averageStableRate,
            availableLiquidity: reserve.availableLiquidity,
            stableDebtLastUpdateTimestamp: reserve.stableDebtLastUpdateTimestamp,
            lastUpdateTimestamp: reserve.lastUpdateTimestamp,
        };
        const supplies = calculateSupplies(reserveSupplyData, currentTimestamp);
        return {
            underlyingAsset: reserve.underlyingAsset,
            symbol: reserve.symbol,
            totalLiquidity: supplies.totalLiquidity.toString(),
            totalVariableDebt: supplies.totalVariableDebt.toString(),
            totalStableDebt: supplies.totalStableDebt.toString(),
            priceInMarketReferenceCurrency: reserve.priceInMarketReferenceCurrency,
            marketReferenceCurrencyDecimals: WEI_DECIMALS,
            decimals: reserve.decimals,
        };
    });

    // Compute the incentive APYs for all reserve assets, returned as dictionary indexed by underlyingAsset
    let reserveIncentives = calculateAllReserveIncentives({
        reserveIncentives: reserveIncentiveData,
        reserves: computedReserves,
    });


    // Add entry with mock address (0xeeeee..) for base asset incentives
    if (
        networkConfig.baseAssetWrappedAddress &&
        reserveIncentives[networkConfig.baseAssetWrappedAddress.toLowerCase()]
    ) {
        reserveIncentives[API_ETH_MOCK_ADDRESS.toLowerCase()] =
            reserveIncentives[networkConfig.baseAssetWrappedAddress.toLowerCase()];
    }
    // Compute the total claimable rewards for a user, returned as dictionary indexed by incentivesController
    let userIncentives = calculateAllUserIncentives({
        reserveIncentives: reserveIncentiveData,
        userReserveIncentives: userIncentiveData,
        userReserves: computedUserReserves,
        currentTimestamp,
    });


    useEffect(() => {
        setLoadingReserveIncentives(true);
        setLoadingUserIncentives(true);
        const incentiveDataProviderAddress = networkConfig.addresses.uiIncentiveDataProvider
        if (incentiveDataProviderAddress) {
            fetchData(currentAccount, lendingPoolAddressProvider, incentiveDataProviderAddress);
            const intervalID = setInterval(
                () => fetchData(currentAccount, lendingPoolAddressProvider, incentiveDataProviderAddress),
                errorReserveIncentives || errorUserIncentives ? RECOVER_INTERVAL : POOLING_INTERVAL
            );
            return () => clearInterval(intervalID);
        } else {
            setLoadingReserveIncentives(false);
            setLoadingUserIncentives(false);
        }

        if(!currentAccount){
            userIncentiveData([])
        }

        return () => {};
    }, [currentAccount, lendingPoolAddressProvider]);
    
    const refresh = () => {
        const incentiveDataProviderAddress = networkConfig.addresses.uiIncentiveDataProvider
        if (incentiveDataProviderAddress) {
            fetchData(currentAccount, lendingPoolAddressProvider, incentiveDataProviderAddress);
        }
    }
    
    return { loading, reserveIncentives, userIncentives, refresh };
};