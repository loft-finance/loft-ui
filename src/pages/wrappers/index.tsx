import { useModel, } from 'umi';
// import { GridContent } from '@ant-design/pro-layout';
import './index.less';
import { metaMask } from '@/lib/connectors/metaMask';
import { Button } from 'antd';

export default (props: any) => {
    // wallet cache
    const { connect, wallet } = useModel('wallet', res => ({
        connect: res.connect,
        wallet: res.wallet
    }))
    const walletCurrent = localStorage.getItem('wallet');

    if (walletCurrent) {
        if (!wallet) {
            if (walletCurrent === 'MetaMask') {
                setTimeout(() => connect(walletCurrent), 500);
            }
        }
    }

    const changeNetwork = async () => {
        try {
            await metaMask.activate(42);
        } catch (e: any) {
            console.log(e);
        }
    }

    return <>
        {
            wallet && wallet.chainId != 42 &&
            <div className="alert">
                App network ({wallet.chainId}) doesn't match to network selected in wallet
                (network with id: {42}).
                <Button size="small" type="primary" shape="round" onClick={changeNetwork}>
                    Change Network
                </Button>
            </div>
        }
        {(props.children)}
    </>
}