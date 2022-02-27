import { useState } from 'react';

import { hooks, metaMask } from '@/lib/connectors/metaMask'
import { message } from 'antd';
const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

const isMetaMaskReady = () => window.ethereum && typeof window.ethereum === 'object';

export default () => {

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

    const connect  = (type: string) => {
        if(current) return;

        if(type == 'MetaMask' && !isMetaMaskReady()){
            return message.error('No MetaMask wallet detected.')
        }

        metamask.connector.activate()
    }
    const disconnect = () => {
        metamask.connector.deactivate()
    }
    const reconnect = (type: string) => {
        console.log('reconnect')
    }
    return { connect, disconnect, reconnect, connecting, current, currentAccount }
}