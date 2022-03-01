import { useState } from 'react';
import { BigNumber, valueToBigNumber } from '@aave/protocol-js';
import { hooks, metaMask } from '@/lib/connectors/metaMask'
import { message } from 'antd';
const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

const isMetaMaskReady = () => window.ethereum && typeof window.ethereum === 'object';

export default () => {

    const [balance, setBalance] = useState(valueToBigNumber('0').dividedBy(valueToBigNumber(10).pow(18)))

    const metamask = {
        connector: metaMask,
        isActivating: useIsActivating(),
        isActive: useIsActive(),
        chainId: useChainId(),
        accounts: useAccounts()
    }

    const current = metamask.isActive ? 'MetaMask' : '';
    const currentAccount = metamask.accounts ? metamask.accounts[0] : ''
    const connecting = metamask.isActivating ? true : false

    const wallet = metamask.isActive ? {
        current,
        currentAccount,
        accounts: metamask.accounts,
        balance
    } : undefined;

    const connect  = async (type: string) => {
        if(current) return;

        if(type == 'MetaMask' && !isMetaMaskReady()){
            return message.error('No MetaMask wallet detected.')
        }

        const res = await metamask.connector.activate()
        console.log('connect res:', res)
    }


    const disconnect = () => {
        metamask.connector.deactivate()
    }
    const reconnect = (type: string) => {
        console.log('reconnect')
    }
    return { connect, disconnect, reconnect, connecting, wallet }
}