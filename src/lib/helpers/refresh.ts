import { useModel } from 'umi';
export const refresh = (params: any = {pool: true, wallet: true, incentives: true}) => {
    const { pool, wallet, incentives } = params
    if(pool){
        const { refresh } = useModel('pool')
        refresh()
    }

    if(wallet){
        const { refresh } = useModel('wallet')
        refresh()
    }
    
    if(incentives){
        const { refresh } = useModel('incentives')
        refresh()
    }
}