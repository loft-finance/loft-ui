import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { ethers } from 'ethers';
import { getProvider } from '@/lib/helpers/provider';
import { config } from "@/lib/config/pledge"
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { valueToBigNumber } from '@aave/math-utils';

const ALLOWANCE_THRESHOLD_VALUE = valueToBigNumber('2').pow(128)
function isAllowanceEnough(allowance: string): boolean {
  return valueToBigNumber(allowance).gt(ALLOWANCE_THRESHOLD_VALUE)
}

const APPROVE_VALUE =  valueToBigNumber('2').pow(256).minus(1).toString(10)

export default () => {
    const { wallet } = useModel('wallet')
    const { current: currentMarket } = useModel('market');
    const [balanceLp, setBalanceLp] = useState(valueToBigNumber('0'));
    const [depositedLp, setDepositedLp] = useState(valueToBigNumber('0'));
    const [balanceLoft, setBalanceLoft] = useState(valueToBigNumber('0'));
    const [depositedLoft, setDepositedLoft] = useState(valueToBigNumber('0'));


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

        setBalanceLp(valueToBigNumber(formatUnits(balanceLp, lp.decimals).toString()))
        setDepositedLp(valueToBigNumber(depositedLp.toString()))
        setBalanceLoft(valueToBigNumber(formatUnits(balanceLoft, loft.decimals).toString()))
        setDepositedLoft(valueToBigNumber(depositedLoft.toString()))
    }
    
    
    const isLpAllowanceEnough = async () => {
        if(!wallet?.currentAccount) return false;
        const chainId = currentMarket.chainId
        const provider = getProvider(chainId);

        const { farm, lp } = config;
        const contract = new ethers.Contract(lp.address, lp.abi, provider);

        const allowance = await contract.allowance(wallet?.currentAccount, farm.address)
        return isAllowanceEnough(allowance.toString())
    }

    const lpApprove = async () => {
      const provider = wallet.provider;
      const signer = provider.getSigner()
      const { farm, lp } = config;
      const contract = new ethers.Contract(lp.address, lp.abi, signer || provider);
      return await contract.approve(farm.address, APPROVE_VALUE)
    }

    const lpDeposit = async (amount: string) => {
      const provider = wallet.provider;
      const signer = provider.getSigner()

      const { farm, lp } = config;
      const contract = new ethers.Contract(farm.address, farm.abi, signer || provider);
      console.log('params:', lp.poolNumber, amount)
      return contract.deposit(lp.poolNumber, amount);
    }

    const lpWithdraw = async (amount: number) => {
      const provider = wallet.provider;
      const signer = provider.getSigner()

      const { farm, lp } = config;
      const contract = new ethers.Contract(farm.address, farm.abi, signer || provider);

      return contract.withdraw(lp.poolNumber, amount);
    }


    const isLoftAllowanceEnough = async () => {
      if(!wallet?.currentAccount) return false;
      const chainId = currentMarket.chainId
      const provider = getProvider(chainId);

      const { farm, loft } = config;
      const contract = new ethers.Contract(loft.address, loft.abi, provider);

      const allowance = await contract.allowance(wallet?.currentAccount, farm.address)
      return isAllowanceEnough(allowance.toString())
    }

    const loftApprove = async () => {
      const chainId = currentMarket.chainId
      const provider = getProvider(chainId);

      const { farm } = config;
      const contract = new ethers.Contract(farm.address, farm.abi, provider);
      return await contract.approve(farm.address, APPROVE_VALUE)
    }

    const loftDeposit = async (amount: number) => {
      const provider = wallet.provider;
      const signer = provider.getSigner()

      const { farm, loft } = config;
      const contract = new ethers.Contract(farm.address, farm.abi, signer || provider);

      return contract.deposit(loft.poolNumber, amount);
    }

    const loftWithdraw = async (amount: number) => {
      const provider = wallet.provider;
      const signer = provider.getSigner()

      const { farm, loft } = config;
      const contract = new ethers.Contract(farm.address, farm.abi, signer || provider);

      return contract.withdraw(loft.poolNumber, amount);
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
            IntervalIdUserReserves = setInterval(() => {
              getUserData()
            }, 30 * 1000)
        }else{
            if(IntervalIdUserReserves) clearInterval(IntervalIdUserReserves)
        }
    },[wallet])

    return { balanceLp, depositedLp, isLpAllowanceEnough, lpApprove, lpDeposit, lpWithdraw,  balanceLoft, depositedLoft, isLoftAllowanceEnough, loftApprove, loftDeposit, loftWithdraw, }
}