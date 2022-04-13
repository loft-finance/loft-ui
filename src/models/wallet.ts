
import { useModel } from 'umi';
import { WalletBalanceProviderFactory } from '@/lib/contracts/WalletBalanceProviderContract';
import { getProvider, getNetwork } from '@/lib/helpers/provider';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default () => {

    const { currentMarket } = useModel('market', res => ({
        currentMarket: res.current
    }));

    const [account, setAccount] = useState<string | null>(null);
    const [balances, setBalances] = useState({});
    const [provider, setProvider] = useState<any>(null);
    const [chainId, setChainId] = useState<number | undefined>();
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const getBalance = async () => {
        if (!account) return;

        const chainId = currentMarket.chainId
        const provider = getProvider(chainId);

        const networkConfig = getNetwork(chainId);
        const contract = WalletBalanceProviderFactory.connect(
            networkConfig.addresses.walletBalanceProvider,
            provider
        );

        const { 0: reserves, 1: balances } =
            await contract.getUserWalletBalances(
                currentMarket.addresses.LENDING_POOL_ADDRESS_PROVIDER,
                account
            );

        const aggregatedBalance = reserves.reduce((acc, reserve, i) => {
            acc[reserve.toLowerCase()] = balances[i].toString();
            return acc;
        }, {} as { [address: string]: string });

        setBalances(aggregatedBalance);
    }

    const refresh = () => {
        getBalance()
    }

    const setWallet = (account: string | null, provider: any, isConnected: boolean, chainId: number | undefined) => {
        setAccount(account);
        setProvider(provider && new ethers.providers.Web3Provider(provider));
        setChainId(chainId);
        setIsConnected(isConnected);
    }

    useEffect(() => {
        if (account) {
            getBalance();
        } else {
            setBalances({});
        }
    }, [account])

    return { account, provider, balances, refresh, setWallet, chainId, isConnected }
}