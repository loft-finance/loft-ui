import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { ethers } from 'ethers';
import { getProvider } from '@/lib/helpers/provider';
import { config } from "@/lib/config/pledge"
import { formatUnits } from 'ethers/lib/utils';

export default () => {
    const { wallet } = useModel('wallet')
    const { current: currentMarket } = useModel('market');
    const [balanceLp, setBalanceLp] = useState('0');
    const [depositedLp, setDepositedLp] = useState('0');
    const [balanceLoft, setBalanceLoft] = useState('0');
    const [depositedLoft, setDepositedLoft] = useState('0');


    const getUserData = async () => {
        if(!wallet?.currentAccount) return;
        const chainId = currentMarket.chainId
        const provider = getProvider(chainId);

        const { farm, lp, loft } = config;
        const contractFarm = new ethers.Contract(farm.address, farm.abi, provider);
        const contractLp = new ethers.Contract(lp.address, lp.abi, provider);
        const contractLoft = new ethers.Contract(loft.address, loft.abi, provider);

        const [balanceLp, depositedLp, balanceLoft, depositedLoft] = await Promise.all([
          contractLp.balanceOf(wallet?.currentAccount),
          contractFarm.deposited(lp.poolNumber, wallet?.currentAccount),
          contractLoft.balanceOf(wallet?.currentAccount),
          contractFarm.deposited(loft.poolNumber, wallet?.currentAccount),
        ])


        setBalanceLp(formatUnits(balanceLp, lp.decimals).toString())
        setDepositedLp(depositedLp.toString())
        setBalanceLoft(formatUnits(balanceLoft, loft.decimals).toString())
        setDepositedLoft(depositedLoft.toString())
    }

    // async function getAPY(
    //     lpTokenAddress: string,
    //     farmAddress: string,
    //     poolNumber: number,
    //     lpMultiplier: number,
    //     dowsPrice: number
    //   ) {
        
    //     if(!wallet?.currentAccount) return;
    //     const chainId = currentMarket.chainId
    //     const provider = getProvider(chainId);

    //     const { address, abi } = config;
    //     const contract = new ethers.Contract(address, abi, provider);

    //     const [_rewardPerBlock, _BONUS_MULTIPLIER, _staked, _poolInfo, _totalAllocPoint] = await Promise.all([
    //       contract.rewardPerBlock(farmAddress),
    //       contract.multiplier(farmAddress),
    //       contract.balanceOf(lpTokenAddress, farmAddress),
    //       contract.poolInfo(farmAddress, poolNumber),
    //       contract.totalAllocPoint(farmAddress)
    //     ])

    //     const rewardPerBlock = valueToBigNumber(_rewardPerBlock)
      
    //     const BONUS_MULTIPLIER = _BONUS_MULTIPLIER.toString()
      
    //     const staked = valueToBigNumber(_staked)
    //       .multipliedBy(lpMultiplier)
      
    //     if (staked.eq(0)) {
    //       return '0'
    //     }
      
    //     const allocPoint = _poolInfo.allocPoint.toString()
      
    //     const totalAllocPoint = _totalAllocPoint.toString()
      
    //     const rewardPerYear = rewardPerBlock.multipliedBy(BONUS_MULTIPLIER)
    //       .multipliedBy(allocPoint)
    //       .dividedBy(totalAllocPoint)
    //       .multipliedBy('10368000')
      
    //     if (poolNumber === 2 && dowsPrice) {
    //       return rewardPerYear.multipliedBy(dowsPrice.toString()).dividedBy(staked)
    //         .multipliedBy(100)
    //         .toString(10)
    //     }
      
    //     return rewardPerYear.dividedBy(staked)
    //       .multipliedBy(100)
    //       .toString(10)
    // }


    let IntervalIdUserReserves: any = undefined

    useEffect(() => {
        if(wallet){
          getUserData()
            // getAPY();
            IntervalIdUserReserves = setInterval(() => {
              getUserData()
            }, 30 * 1000)
        }else{
            if(IntervalIdUserReserves) clearInterval(IntervalIdUserReserves)
        }
    },[wallet])

    return { balanceLp, depositedLp, balanceLoft, depositedLoft }
}