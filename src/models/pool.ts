import { useState } from 'react';
import { ethers } from 'ethers';
import { networks } from '@/lib/config/networks';
import { useModel } from 'umi';
import dayjs from 'dayjs';
import {
    formatReserve,
    // FormatReserveResponse,
    // formatUserSummary,
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

    const [loading, setLoading] = useState(false);
    const [baseCurrency, setbaseCurrency] = useState({})
    const [reserves, setReserves] = useState([]);

    const [userReserves, setUserReserves] = useState([]);
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
            const reserves = format(reservesData)
            
            setReserves(reserves);
            setbaseCurrency(baseCurrencyData)
        } catch (e) {
            console.log('e', e);
        }
        setLoading(false);
    }

    const format = (reserves: any) => {
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

    return { loading, baseCurrency, reserves, getReserves };
};