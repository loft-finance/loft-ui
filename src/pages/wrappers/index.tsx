import { useModel, FormattedMessage, useLocation } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import styles from './index.less'
export default (props: any) => {
    // wallet cache
    const { connect, wallet } = useModel('wallet', res => ({
        connect: res.connect,
        wallet: res.wallet
    }))
    const walletCurrent = localStorage.getItem('wallet');
    if(walletCurrent){
        if(!wallet){
            if(walletCurrent === 'MetaMask'){
                setTimeout(()=>connect(walletCurrent), 500);
            }
        }
    }
    
    const { pathname } = useLocation()
    return <>
        {pathname && pathname != '/market/index' && !wallet &&
        <GridContent>
            <div className={styles.alert}>
                <FormattedMessage id="pages.market.detail.alert" />
            </div>
        </GridContent>
        }
        {(props.children)}
    </>
}