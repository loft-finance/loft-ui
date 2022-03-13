import { useEffect, useState } from 'react';
import { message } from 'antd';
import { useModel } from 'umi';
import { valueToBigNumber } from '@aave/protocol-js';
import { hooks, metaMask } from '@/lib/connectors/metaMask'
import { WalletBalanceProviderFactory } from '@/lib/contracts/WalletBalanceProviderContract';
import { getProvider, getNetwork } from '@/lib/helpers/provider';

const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

const isMetaMaskReady = () => window.ethereum && typeof window.ethereum === 'object';

export default () => {

    const { current: currentMarket } = useModel('market');

    const [balance, setBalance] = useState(valueToBigNumber('0').dividedBy(valueToBigNumber(10).pow(18)))
    const [balances, setBalances] = useState({})

    const metamask = {
        connector: metaMask,
        isActivating: useIsActivating(),
        isActive: useIsActive(),
        chainId: useChainId(),
        accounts: useAccounts()
    }

    const provider = useProvider();
    // const error = useError()
    const current = metamask.isActive ? 'MetaMask' : '';
    const currentAccount = metamask.accounts ? metamask.accounts[0] : ''
    const connecting = metamask.isActivating ? true : false

    const wallet = metamask.isActive ? {
        current,
        currentAccount,
        accounts: metamask.accounts,
        balance,
        provider
    } : undefined;

    // console.log('wallet:', wallet, error)

    const connect  = async (type: string) => {
        if(current) return;

        if(type == 'MetaMask' && !isMetaMaskReady()){
            return message.error('No MetaMask wallet detected.')
        }

        const res = await metamask.connector.activate()
        // console.log('connect res:', res)
    }

    const getBalance = async () => {
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
            currentAccount
        );
        
        const aggregatedBalance = reserves.reduce((acc, reserve, i) => {
            acc[reserve.toLowerCase()] = balances[i].toString();
            return acc;
        }, {} as { [address: string]: string });

        // console.log('wallet balance:',aggregatedBalance)
        setBalances(aggregatedBalance)
        // setMarkets((prev) => ({ ...prev, [currentMarket]: aggregatedBalance }));
    }

    const disconnect = () => {
        metamask.connector.deactivate()
    }
    const reconnect = (type: string) => {
        console.log('reconnect')
    }

    useEffect(() => {
        if(currentAccount){
            getBalance();
        }else{
            setBalance(valueToBigNumber('0').dividedBy(valueToBigNumber(10).pow(18)))
        }
    },[currentAccount])
    return { connect, disconnect, reconnect, connecting, wallet, balances }
}