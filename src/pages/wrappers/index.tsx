import { useModel } from 'umi';
export default (props: any) => {
    // wallet cache
    const walletCurrent = localStorage.getItem('wallet');
    if(walletCurrent){
        const { connect, wallet } = useModel<any>('wallet')
        if(!wallet){
            if(walletCurrent === 'MetaMask'){
            connect(walletCurrent);
            }
        }
    }

    return (props.children)
}