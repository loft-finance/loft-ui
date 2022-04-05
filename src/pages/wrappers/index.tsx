import { useModel } from 'umi';
export default (props: any) => {
    // wallet cache
    const walletCurrent = localStorage.getItem('wallet');
    if(walletCurrent){
        const { connect, wallet } = useModel('wallet', res => ({
            connect: res.connect,
            wallet: res.wallet
        }))
        if(!wallet){
            if(walletCurrent === 'MetaMask'){
                setTimeout(()=>connect(walletCurrent), 500);
            }
        }
    }
    
    return (props.children)
}