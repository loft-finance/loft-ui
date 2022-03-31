import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { ethers } from 'ethers';
import { getProvider } from '@/lib/helpers/provider';
import { config } from "@/lib/config/pledge"
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { valueToBigNumber } from '@aave/math-utils';
import { toWei, weiToBigNumber } from '@/lib/helpers/utils';

const ALLOWANCE_THRESHOLD_VALUE = valueToBigNumber('2').pow(128)
function isAllowanceEnough(allowance: string): boolean {
  return valueToBigNumber(allowance).gt(ALLOWANCE_THRESHOLD_VALUE)
}

const APPROVE_VALUE =  valueToBigNumber('2').pow(256).minus(1).toString(10)

export default () => {
    const { wallet } = useModel('wallet')
    const { current: currentMarket } = useModel('market');

    const [lpApy, setLpApy] = useState(valueToBigNumber('0'));
    const [lpRewardPerYear, setLpRewardPerYear] = useState(valueToBigNumber('0'));
    const [loftApy, setLoftpApy] = useState(valueToBigNumber('0'));
    const [loftRewardPerYear, setLoftRewardPerYear] = useState(valueToBigNumber('0'));

    const [balanceLp, setBalanceLp] = useState(valueToBigNumber('0'));
    const [depositedLp, setDepositedLp] = useState(valueToBigNumber('0'));
    const [earnedLp, setEarnedLp] = useState(valueToBigNumber('0'));
    const [balanceLoft, setBalanceLoft] = useState(valueToBigNumber('0'));
    const [depositedLoft, setDepositedLoft] = useState(valueToBigNumber('0'));
    const [earnedLoft, setEarnedLoft] = useState(valueToBigNumber('0'));


    const getUserData = async () => {
        if(!wallet?.currentAccount) return;
        const chainId = currentMarket.chainId
        const provider = getProvider(chainId);

        const { farm, lp, loft } = config;
        const contractFarm = new ethers.Contract(farm.address, farm.abi, provider);
        const contractLp = new ethers.Contract(lp.address, lp.abi, provider);
        const contractLoft = new ethers.Contract(loft.address, loft.abi, provider);

        const [balanceLp, depositedLp, earnedLp, balanceLoft, depositedLoft, earnedLoft] = await Promise.all([
          contractLp.balanceOf(wallet?.currentAccount),
          contractFarm.deposited(lp.poolNumber, wallet?.currentAccount),
          contractFarm.pending(lp.poolNumber, wallet?.currentAccount),
          contractLoft.balanceOf(wallet?.currentAccount),
          contractFarm.deposited(loft.poolNumber, wallet?.currentAccount),
          contractFarm.pending(loft.poolNumber, wallet?.currentAccount),
        ])

        setBalanceLp(valueToBigNumber(formatUnits(balanceLp, lp.decimals).toString()))
        setDepositedLp(valueToBigNumber(formatUnits(depositedLp, lp.decimals).toString()))
        setEarnedLp(valueToBigNumber(formatUnits(earnedLp, lp.decimals).toString()))
        setBalanceLoft(valueToBigNumber(formatUnits(balanceLoft, loft.decimals).toString()))
        setDepositedLoft(valueToBigNumber(formatUnits(depositedLoft, loft.decimals).toString()))
        setEarnedLoft(valueToBigNumber(formatUnits(earnedLoft, loft.decimals).toString()))
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
      const amountInWei = toWei(amount)

      return contract.deposit(lp.poolNumber, amountInWei);
    }

    const lpWithdraw = async (amount: number) => {
      const provider = wallet.provider;
      const signer = provider.getSigner()

      const { farm, lp } = config;
      const contract = new ethers.Contract(farm.address, farm.abi, signer || provider);
      const amountInWei = toWei(amount)
      return contract.withdraw(lp.poolNumber, amountInWei);
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
      const provider = wallet.provider;
      const signer = provider.getSigner()
      const { farm, loft } = config;
      const contract = new ethers.Contract(loft.address, loft.abi, signer || provider);
      return await contract.approve(farm.address, APPROVE_VALUE)
    }

    const loftDeposit = async (amount: number) => {
      const provider = wallet.provider;
      const signer = provider.getSigner()

      const { farm, loft } = config;
      const contract = new ethers.Contract(farm.address, farm.abi, signer || provider);
      const amountInWei = toWei(amount)
      return contract.deposit(loft.poolNumber, amountInWei);
    }

    const loftWithdraw = async (amount: number) => {
      const provider = wallet.provider;
      const signer = provider.getSigner()

      const { farm, loft } = config;
      const contract = new ethers.Contract(farm.address, farm.abi, signer || provider);
      const amountInWei = toWei(amount)
      return contract.withdraw(loft.poolNumber, amountInWei);
    }

    async function getLpAPY() {

      const chainId = currentMarket.chainId
      const provider = getProvider(chainId);

      const { farm, lp } = config;
      const contractFarm = new ethers.Contract(farm.address, farm.abi, provider);
      const contractLp = new ethers.Contract(lp.address, lp.abi, provider);

      const [_rewardPerBlock, _BONUS_MULTIPLIER, _staked, _poolInfo, _totalAllocPoint] = await Promise.all([
        contractFarm.rewardPerBlock(),
        contractFarm.BONUS_MULTIPLIER(),
        contractLp.balanceOf(farm.address),
        contractFarm.poolInfo(lp.poolNumber),
        contractFarm.totalAllocPoint()
      ])
      const rewardPerBlock = weiToBigNumber(_rewardPerBlock)
    
      const BONUS_MULTIPLIER = _BONUS_MULTIPLIER.toString()
    
      const staked = weiToBigNumber(_staked)
        .multipliedBy(lp.multiplier)
    
      if (staked.eq(0)) {
        return '0'
      }
    
      const allocPoint = _poolInfo.allocPoint.toString()
    
      const totalAllocPoint = _totalAllocPoint.toString()
    
      const rewardPerYear = rewardPerBlock.multipliedBy(BONUS_MULTIPLIER)
        .multipliedBy(allocPoint)
        .dividedBy(totalAllocPoint)
        .multipliedBy('10368000')
    
      // if (lp.poolNumber === 2 && lp.price) {
      //   return rewardPerYear.multipliedBy(lp.price.toString()).dividedBy(staked)
      //     .multipliedBy(100)
      //     .toString(10)
      // }
      
      setLpRewardPerYear(rewardPerYear);

      return rewardPerYear.dividedBy(staked)
        .multipliedBy(100)
        .toString(10)
    }

    async function getLoftAPY() {

      const chainId = currentMarket.chainId
      const provider = getProvider(chainId);

      const { farm, loft } = config;
      const contractFarm = new ethers.Contract(farm.address, farm.abi, provider);
      const contractLoft = new ethers.Contract(loft.address, loft.abi, provider);

      const [_rewardPerBlock, _BONUS_MULTIPLIER, _staked, _poolInfo, _totalAllocPoint] = await Promise.all([
        contractFarm.rewardPerBlock(),
        contractFarm.BONUS_MULTIPLIER(),
        contractLoft.balanceOf(farm.address),
        contractFarm.poolInfo(loft.poolNumber),
        contractFarm.totalAllocPoint()
      ])
      const rewardPerBlock = weiToBigNumber(_rewardPerBlock)
    
      const BONUS_MULTIPLIER = _BONUS_MULTIPLIER.toString()
    
      const staked = weiToBigNumber(_staked)
        .multipliedBy(loft.multiplier)
    
      if (staked.eq(0)) {
        return '0'
      }
    
      const allocPoint = _poolInfo.allocPoint.toString()
    
      const totalAllocPoint = _totalAllocPoint.toString()
    
      const rewardPerYear = rewardPerBlock.multipliedBy(BONUS_MULTIPLIER)
        .multipliedBy(allocPoint)
        .dividedBy(totalAllocPoint)
        .multipliedBy('10368000')
    
      // if (loft.poolNumber === 2 && loft.price) {
      //   return rewardPerYear.multipliedBy(loft.price.toString()).dividedBy(staked)
      //     .multipliedBy(100)
      //     .toString(10)
      // }

      setLoftRewardPerYear(rewardPerYear);
    
      return rewardPerYear.dividedBy(staked)
        .multipliedBy(100)
        .toString(10)
    }

    const getPublicData = async () => {
      const lpApy = await getLpAPY()
      const loftApy = await getLoftAPY()
      // const { loft, lp } = config;
      console.log('apy:', lpApy, loftApy)
      setLpApy(valueToBigNumber(lpApy))
      setLoftpApy(valueToBigNumber(loftApy))
    }

    let IntervalIdUserReserves: any = undefined

    useEffect(() => {
      getPublicData()
      if(wallet){
        getUserData()
          IntervalIdUserReserves = setInterval(() => {
            getUserData()
          }, 30 * 1000)
      }else{
          if(IntervalIdUserReserves) clearInterval(IntervalIdUserReserves)
      }
    },[wallet])

    const refresh = () => {
      getUserData()
    }

    return {  
      lpRewardPerYear, lpApy, 
      balanceLp, depositedLp, earnedLp, 
      isLpAllowanceEnough, lpApprove, lpDeposit, lpWithdraw, getLpAPY, 

      loftRewardPerYear, loftApy,  
      balanceLoft, depositedLoft,earnedLoft, 
      isLoftAllowanceEnough, loftApprove, loftDeposit, loftWithdraw, getLoftAPY, 
      refresh 
    }
}