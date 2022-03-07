import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { networks } from '@/lib/config/networks';
import { useModel } from 'umi';
import dayjs from 'dayjs';
import {
    formatReserve,
    formatUserSummary,
    normalize,
} from '@aave/math-utils';
import {
    UiPoolDataProvider,
    ChainId,
} from '@aave/contract-helpers';
import { API_ETH_MOCK_ADDRESS } from '@aave/protocol-js';
import { assetsOrder } from '@aave/aave-ui-kit';


const providers: { [network: string]: ethers.providers.Provider } = {};

export default () => {
    const { current: currentMarket } = useModel('market');
    const { wallet } = useModel('wallet')

    

    const [loading, setLoading] = useState(false);
    const [baseCurrency, setbaseCurrency] = useState<any>({})
    const [reserves, setReserves] = useState([]);
    const [userReserves, setUserReserves] = useState<any>(undefined);
    const [userReservesBase, setUserReservesBase] = useState<any>([]);
    // const [user, setUser] = useState({});

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
            
            let reserves = fixUnderlyingReserves(reservesData);

            reserves = formatReserves(reserves)
            
            setReserves(reserves);
            setbaseCurrency(baseCurrencyData)
        } catch (e) {
            console.log('e', e);
        }
        setLoading(false);
    }

    const getUserReserves = async () => {
        if(!wallet?.currentAccount) return;

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
                wallet?.currentAccount
            );
            console.log('userReservesResponse', userReservesResponse)
            if(userReservesResponse){
                let res = fixUnderlyingUserReserves(reserves, userReservesResponse);
                res = formatUserReserves(res)
                console.log('formatUserReserves', res)
                setUserReserves(res);
            }
        } catch (e) {
            console.log('e', e);
        }
        setLoading(false);
    }
    const fixUnderlyingReserves = (reserves) => {
        const chainId = currentMarket.chainId
        const networkConfig = getNetwork(chainId);
        reserves
            ?.map((reserve) => {
            if (reserve.symbol.toUpperCase() === `W${networkConfig.baseAsset}`) {
                return {
                ...reserve,
                symbol: networkConfig.baseAsset,
                underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
                };
            }
            if (
                reserve.underlyingAsset.toLowerCase() ===
                '0x50379f632ca68d36e50cfbc8f78fe16bd1499d1e'.toLowerCase()
            ) {
                reserve.symbol = 'GUNIDAIUSDC';
            }
            if (
                reserve.underlyingAsset.toLowerCase() ===
                '0xd2eec91055f07fe24c9ccb25828ecfefd4be0c41'.toLowerCase()
            ) {
                reserve.symbol = 'GUNIUSDCUSDT';
            }
            return reserve;
            })
            .sort(
            ({ symbol: a }, { symbol: b }) =>
                assetsOrder.indexOf(a.toUpperCase()) - assetsOrder.indexOf(b.toUpperCase())
            );
        return reserves
    }

    const fixUnderlyingUserReserves = (reserves, userReserves) => {
        const chainId = currentMarket.chainId
        const networkConfig = getNetwork(chainId);

        const list: any = [];
        const listBase: any = []
        userReserves?.forEach((userReserve) => {
            const reserve = reserves?.find(
            (reserve) =>
                reserve.underlyingAsset.toLowerCase() === userReserve.underlyingAsset.toLowerCase()
            );
            if (reserve) {
                const reserveWithBase = {
                    ...userReserve,
                    reserve,
                };
                listBase.push(reserveWithBase);
                if (reserve.symbol.toUpperCase() === `W${networkConfig.baseAsset}`) {
                    const userReserveFixed = {
                    ...userReserve,
                    underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
                    reserve: {
                        ...reserve,
                        symbol: networkConfig.baseAsset,
                        underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
                    },
                    };
                    list.push(userReserveFixed);
                } else {
                    list.push(reserveWithBase);
                }
            }
        });

        setUserReservesBase(listBase)
        return list;
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
        const marketRefCurrencyDecimals = baseCurrency?.marketReferenceCurrencyDecimals ? baseCurrency?.marketReferenceCurrencyDecimals : 18;
        let marketRefPriceInUsd = baseCurrency?.marketReferenceCurrencyPriceInUsd ? baseCurrency.marketReferenceCurrencyPriceInUsd : '0';
        marketRefPriceInUsd = normalize(marketRefPriceInUsd, 8)

        const computedUserData =
        wallet?.currentAccount && rawUserReserves
            ? formatUserSummary({
                currentTimestamp,
                marketRefPriceInUsd,
                marketRefCurrencyDecimals,
                rawUserReserves: rawUserReserves,
                })
            : undefined;
            console.log('computedUserData',currentTimestamp,computedUserData)
        return {
            id: wallet?.currentAccount,
            ...computedUserData
        }
    }

    
    let IntervalIdReserves = undefined
    let IntervalIdUserReserves = undefined

    const start = async() => {
        await getReserves()
        IntervalIdReserves = setInterval(() => {
            getReserves()
        }, 30 * 1000)
        if(wallet?.currentAccount){
            await getUserReserves()
            IntervalIdUserReserves = setInterval(() => {
                getUserReserves()
            }, 30 * 1000)
        }
    }

    useEffect(() => {
        getReserves()
        if(wallet){
            getUserReserves()
            IntervalIdUserReserves = setInterval(() => {
                getUserReserves()
            }, 30 * 1000)
        }else{
            if(IntervalIdUserReserves) clearInterval(IntervalIdUserReserves)
        }
    },[wallet])

    return { loading, baseCurrency, reserves, user: userReserves, userReservesBase, start };
};