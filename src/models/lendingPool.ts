import { useModel } from 'umi';
import { LendingPool } from '@aave/contract-helpers';

import { getProvider } from '@/lib/helpers/provider';

export default () =>  {
    const { currentMarket } = useModel('market', res => ({
        currentMarket: res.current
    }));
    const chainId = currentMarket.chainId
    
    const lendingPool: any = new LendingPool(getProvider(chainId), {
        LENDING_POOL: currentMarket.addresses.LENDING_POOL,
        REPAY_WITH_COLLATERAL_ADAPTER: currentMarket.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
        SWAP_COLLATERAL_ADAPTER: currentMarket.addresses.SWAP_COLLATERAL_ADAPTER,
        WETH_GATEWAY: currentMarket.addresses.WETH_GATEWAY,
    });

    return { lendingPool }
}
