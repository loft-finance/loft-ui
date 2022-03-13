import { ethers } from 'ethers';
import { networks } from '@/lib/config/networks';
import { ChainId } from '@aave/contract-helpers';
const providers: { [network: string]: ethers.providers.Provider } = {};

export const getNetwork = (chainId: ChainId) => {
    const config = networks[chainId];
    if (!config) {
        throw new Error(`Network with chainId "${chainId}" was not configured`);
    }
    return { ...config };
}

export const getProvider = (chainId: ChainId): ethers.providers.Provider => {
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
