import React, { useRef, useState } from 'react';
import { useModel } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import Overview from './overview';
import Bignumber from '@/components/Bignumber';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import WalletEmpty from '@/components/Wallet/Empty';
import { BigNumber, valueToBigNumber } from '@aave/protocol-js';
import { getAssetInfo } from '@/lib/config/assets'
import { getNetwork } from '@/lib/helpers/provider';


export default (props) => {
  const { match: { params: { underlyingAsset,id } } } = props

  const { wallet, balances } = useModel('wallet');
  const { reserves, user, baseCurrency } = useModel('pool')
  const { current: currentMarket } = useModel('market');

  const balance = balances ? balances[underlyingAsset] : '0'

  const poolReserve = reserves.find((res) =>
        id? res.id === id : res.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
      );
  const asset = getAssetInfo(id);

  const chainId = currentMarket.chainId
  const networkConfig = getNetwork(chainId);

  let walletBalance = valueToBigNumber('0').dividedBy(valueToBigNumber(10).pow(18))

  if(balance && poolReserve) {
    walletBalance = valueToBigNumber(balance).dividedBy(valueToBigNumber(10).pow(poolReserve.decimals))
  }

  let maxAmountToDeposit = valueToBigNumber(walletBalance);
  if (maxAmountToDeposit.gt(0) && poolReserve.symbol.toUpperCase() === networkConfig.baseAsset) {
    // keep it for tx gas cost
    maxAmountToDeposit = maxAmountToDeposit.minus('0.001');
  }
  if (maxAmountToDeposit.lte(0)) {
    maxAmountToDeposit = valueToBigNumber('0');
  }

  const userReserve = user
        ? user.userReservesData.find((userReserve) =>
            id
                ? userReserve.reserve.id === id
                : userReserve.reserve.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
        )
        : undefined;
  
  return (
    <GridContent>
      <Info
        items={[
          {
            title: 'Your balance in Aave',
            value: <Bignumber value={userReserve?.underlyingBalance || '0'} />,
          },
          {
            title: 'Your wallet balance',
            value: <><Bignumber value={walletBalance} /> FUSDT</>,
          },
          {
            title: 'Fitness factor',
            value: <Bignumber value={user?.healthFactor || '-1'} />,
          },
        ]}
      />
      <Overview  poolReserve={poolReserve} marketRefPriceInUsd={baseCurrency.marketRefPriceInUsd} />

      {!wallet && <WalletDisconnected />}

      {wallet && walletBalance.eq('0') && <WalletEmpty symbol={poolReserve?poolReserve?.symbol:''} />}

      {wallet && !walletBalance.eq('0') && React.cloneElement(props.children, { poolReserve, userReserve,  maxAmountToDeposit: maxAmountToDeposit.toString(10) }) }
    </GridContent>
  );
};
