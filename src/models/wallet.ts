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
    useChainId,
    // useError,
    // useENSNames
} = hooks

const isMetaMaskReady = () => window.ethereum && typeof window.ethereum === 'object';

export default () => {
    const { currentMarket } = useModel('market', res => ({
        currentMarket: res.current
    }));

    const [current, setCurrent] = useState('');
    const [status, setStatus] = useState('unconnect');
    const [currentAccount, setCurrentAccount] = useState('');
    const [currentChainId, setCurrentChainId] = useState<number | undefined>(undefined);
    const [currentProvider, setCurrentProvider] = useState<any>(undefined);
    const [balances, setBalances] = useState({});
    const [wallet, setWallet] = useState<any>(undefined);

    const [isConnect, setIsConnect] = useState(false);
    const walletRef = useRef<any>();

    const chainId = useChainId();
    const isActivating = useIsActivating();
    const isActive = useIsActive();
    const accounts = useAccounts();
    const provider = useProvider();
    // const error = useError();
    console.log(isActivating, isActive, accounts, chainId);

    useEffect(() => {
        if (current == 'MetaMask') {
            if (isActivating && !isActive) {
                setStatus('connecting')
            } else if (isActive) {
                setStatus('connected')
                accounts && setCurrentAccount(accounts[0]);
                setCurrentChainId(chainId);
                setCurrentProvider(provider);

                setWallet({
                    current,
                    currentAccount: accounts && accounts[0],
                    provider: provider,
                    chainId: chainId
                });

                localStorage.setItem('wallet', current);
            } else {
                if(!isConnect){
                    setCurrent('')
                    setStatus('unconnect');
                    setCurrentAccount('')
                    setCurrentChainId(undefined);
                    setCurrentProvider(undefined);
                }
               
            }

        }
    }, [isActivating, isActive, accounts, chainId]);

    const connect = async (type: string) => {
        if (current) return;

        if (type == 'MetaMask') {
            if (!isMetaMaskReady()) {
                return message.error('No MetaMask wallet detected.')
            }

            setCurrent(type)
            walletRef.current = metaMask
        }

        walletRef.current.activate();
        setIsConnect(true);
    }
    const disconnect = () => {
        walletRef.current.deactivate();
        setIsConnect(false);
        localStorage.removeItem('wallet');
        
    }

    const getBalance = async () => {
        if (!currentAccount) return;

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

    const refresh = () => {
        getBalance()
    }

    useEffect(() => {
        if (currentAccount) {
            getBalance();
        } else {
            setBalances({})
        }
    }, [currentAccount])

    return { connect, disconnect, status, wallet, balances, refresh, currentChainId, currentProvider }
}