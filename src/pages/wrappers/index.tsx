import { metaMask } from '@/lib/connectors/metaMask';
import { Button } from 'antd';
import { useWallet } from 'use-wallet';
import { useEffect } from 'react';
import { useModel } from 'umi';

export default (props: any) => {
    const { chainId, isConnected, account, ethereum } = useWallet();

    const { setWallet } = useModel('wallet', res => ({
        setWallet: res.setWallet
    }));

    const changeNetwork = async () => {
        try {
            await metaMask.activate(42);
        } catch (e: any) {
            console.log(e);
        }
    }

    useEffect(() => {
        setWallet(account, ethereum, isConnected(), chainId)
    }, [isConnected, account, ethereum, chainId])

    return <>
        {
            isConnected() && chainId != 42 &&
            <div className="alert">
                App network ({chainId}) doesn't match to network selected in wallet
                (network with id: {42}).
                <Button size="small" type="primary" shape="round" onClick={changeNetwork}>
                    Change Network
                </Button>
            </div>
        }
        {(props.children)}
    </>
}