import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { ethers } from 'ethers';
import { getProvider } from '@/lib/helpers/provider';
import { config } from "@/lib/config/pledge"
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { valueToBigNumber } from '@aave/math-utils';
import { toWei } from '@/lib/helpers/utils';

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
        setDepositedLp(valueToBigNumber(formatUnits(depositedLp, lp.decimals).toString()))
        setBalanceLoft(valueToBigNumber(formatUnits(balanceLoft, loft.decimals).toString()))
        setDepositedLoft(valueToBigNumber(formatUnits(depositedLoft, loft.decimals).toString()))
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
      console.log('params:', lp.poolNumber, amountInWei)
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