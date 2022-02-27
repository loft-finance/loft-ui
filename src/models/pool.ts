import { useState } from 'react';
import { ethers } from 'ethers';
import { networks } from '@/lib/config/networks';
import { useModel } from 'umi';
import dayjs from 'dayjs';
import {
    formatReserve,
    // FormatReserveResponse,
    formatUserSummary,
    // FormatUserSummaryResponse,
    normalize,
  } from '@aave/math-utils';
  import {
    UiPoolDataProvider,
    // ReservesDataHumanized,
    // UserReserveDataHumanized,
    ChainId,
  } from '@aave/contract-helpers';


const providers: { [network: string]: ethers.providers.Provider } = {};

export default () => {
    const { current: currentMarket } = useModel('market');
    const { currentAccount } = useModel('wallet')

    const [loading, setLoading] = useState(false);
    const [baseCurrency, setbaseCurrency] = useState<any>({})
    const [reserves, setReserves] = useState([]);

    const [userReserves, setUserReserves] = useState<any>(undefined);
    const [user, setUser] = useState({});

    const getNetwork = (chainId: ChainId) => {
        const config = networks[chainId];
        if (!config) {
            throw new Error(`Network with chainId "${chainId}" was not configured`);
        }
        return { ...config };
    }

    const getProvider = (chainId: ChainId): ethers.providers.Provider => {
        if (!providers[chainId]) {
            const config = getNetwork(chainId);
            const chainProviders: ethers.providers.StaticJsonRpcProvider[] = [];
            if (config.privateJsonRPCUrl) {
                providers[chainId] = new ethers.providers.StaticJsonRpcProvider(
                    config.privateJsonRPCUrl,
                    chainId
                );
                return providers[chainId];
            }
            if (config.publicJsonRPCUrl.length) {
                config.publicJsonRPCUrl.map((rpc) =>
                    chainProviders.push(new ethers.providers.StaticJsonRpcProvider(rpc, chainId))
                );
            }
            if (!chainProviders.length) {
                throw new Error(`${chainId} has no jsonRPCUrl configured`);
            }
            if (chainProviders.length === 1) {
                providers[chainId] = chainProviders[0];
            } else {
                providers[chainId] = new ethers.providers.FallbackProvider(chainProviders);
            }
        }

        return providers[chainId];
    }

    const getReserves = async () => {
        const chainId = currentMarket.chainId
        const provider = getProvider(chainId);

        const networkConfig = getNetwork(chainId);
        const contract = new UiPoolDataProvider({
            uiPoolDataProviderAddress: networkConfig.addresses.uiPoolDataProvider,
            provider,
        });
        const lendingPoolAddressProvider = currentMarket.addresses.LENDING_POOL_ADDRESS_PROVIDER
        try {
            setLoading(true);
            const { reservesData, baseCurrencyData } = await contract.getReservesHumanized(
                lendingPoolAddressProvider
            );
            const reserves = formatReserves(reservesData)
            
            setReserves(reserves);
            setbaseCurrency(baseCurrencyData)
        } catch (e) {
            console.log('e', e);
        }
        setLoading(false);
    }

    const getUserReserves = async () => {
        if(!currentAccount) return;

        const chainId = currentMarket.chainId
        const provider = getProvider(chainId);

        const networkConfig = getNetwork(chainId);
        const contract = new UiPoolDataProvider({
            uiPoolDataProviderAddress: networkConfig.addresses.uiPoolDataProvider,
            provider,
        });
        const lendingPoolAddressProvider = currentMarket.addresses.LENDING_POOL_ADDRESS_PROVIDER
        try {
            setLoading(true);
            const userReservesResponse = await contract.getUserReservesHumanized(
                lendingPoolAddressProvider,
                currentAccount
            );
            if(userReservesResponse){
                const res = formatUserReserves(userReservesResponse)
                setUserReserves(res);
            }
        } catch (e) {
            console.log('e', e);
        }
        setLoading(false);
    }

    const formatReserves = (reserves: any) => {
        const currentTimestamp = dayjs().unix();
        const marketRefCurrencyDecimals = 18;
        let list: any = []
        reserves.map((reserve: any) => {
            const formattedReserve = formatReserve({
                reserve,
                currentTimestamp
            })

            const fullReserve = {
                ...reserve,
                ...formattedReserve,
                priceInMarketReferenceCurrency: normalize(
                  reserve.priceInMarketReferenceCurrency,
                  marketRefCurrencyDecimals
                ),
            };
            list.push(fullReserve)
        })
        return list
    }

    const formatUserReserves = (rawUserReserves: any) => {
        const currentTimestamp = dayjs().unix();
        const marketRefCurrencyDecimals = 18;
        let marketRefPriceInUsd = baseCurrency?.marketReferenceCurrencyPriceInUsd ? baseCurrency.marketReferenceCurrencyPriceInUsd
        : '0';
        marketRefPriceInUsd = normalize(marketRefPriceInUsd, 8)

        const computedUserData =
        currentAccount && rawUserReserves
            ? formatUserSummary({
                currentTimestamp,
                marketRefPriceInUsd,
                marketRefCurrencyDecimals,
                rawUserReserves: rawUserReserves,
                })
            : undefined;
        return {
            id: currentAccount,
            ...computedUserData
        }
    }

    const start = async() => {
        await getReserves()
        await getUserReserves()
        // setInterval(()=>{
        //     getReserves()
        //     getUserReserves()
        // }, 30 * 1000)
    }

    return { loading, baseCurrency, reserves, userReserves, start };
};