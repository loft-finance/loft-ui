import { useEffect, useState, useRef } from 'react';
import { message } from 'antd';
import { useModel } from 'umi';
import { hooks, metaMask } from '@/lib/connectors/metaMask'
import { WalletBalanceProviderFactory } from '@/lib/contracts/WalletBalanceProviderContract';
import { getProvider, getNetwork } from '@/lib/helpers/provider';

const { 
    useIsActivating, 
    useIsActive,
    useAccounts,
    useProvider, 
    // useChainId, 
    // useError,
    // useENSNames 
} = hooks

const isMetaMaskReady = () => window.ethereum && typeof window.ethereum === 'object';

export default () => {

    const { current: currentMarket } = useModel('market');

    const [current, setCurrent] = useState('');
    const [status, setStatus] = useState('unconnect');
    const [currentAccount, setCurrentAccount] = useState('');
    const [balances, setBalances] = useState({})

    const walletRef = useRef<any>();

    const metamask = {
        isActivating: useIsActivating(),
        isActive: useIsActive(),
        accounts: useAccounts(),
        provider: useProvider()
    }

    useEffect(() => {
        if(current == 'MetaMask'){
            if(metamask.isActivating && !metamask.isActive){
                setStatus('connecting')
            }else if(metamask.isActive){
                setStatus('connected')
                if(metamask?.accounts){
                    setCurrentAccount(metamask.accounts[0])
                }
                localStorage.setItem('wallet', current)
            }else{
                setStatus('unconnect');
                setCurrentAccount('')
            }
        }
    },[metamask])

    const connect  = async (type: string) => {
        if(current) return;

        if(type == 'MetaMask'){
            if(!isMetaMaskReady()){
                return message.error('No MetaMask wallet detected.')
            }
            
            setCurrent(type)
            walletRef.current = metaMask
        }

        walletRef.current.activate()
    }
    const disconnect = () => {
        walletRef.current.deactivate()
        setCurrent('')
    }

    const getBalance = async () => {
        if(!currentAccount) return;

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

        setBalances(aggregatedBalance)
    }

    const getWallet = (): any => {
        if(status === 'connected'){
            if(current === 'MetaMask'){
                return {
                    current,
                    currentAccount,
                    balances,
                    provider: metamask.provider
                }
            }
        }

        return false;
    }

    useEffect(() => {
        if(currentAccount){
            getBalance();
        }
    },[currentAccount])

    return { connect, disconnect, status, wallet: getWallet(), balances }
}