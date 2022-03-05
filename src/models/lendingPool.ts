import { useModel } from 'umi';
import { LendingPool } from '@aave/contract-helpers';
import { ethers } from 'ethers';
import { networks } from '@/lib/config/networks';
import { ChainId } from '@aave/contract-helpers';

const providers: { [network: string]: ethers.providers.Provider } = {};

export default () =>  {
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
    
    const { current: currentMarket } = useModel('market');
    const chainId = currentMarket.chainId
    
    const lendingPool = new LendingPool(getProvider(chainId), {
        LENDING_POOL: currentMarket.addresses.LENDING_POOL,
        REPAY_WITH_COLLATERAL_ADAPTER: currentMarket.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
        SWAP_COLLATERAL_ADAPTER: currentMarket.addresses.SWAP_COLLATERAL_ADAPTER,
        WETH_GATEWAY: currentMarket.addresses.WETH_GATEWAY,
    });

    return { lendingPool }
}
