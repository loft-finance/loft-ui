import React, { useRef, useState } from 'react';
import { useModel } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import Overview from './overview';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import WalletEmpty from '@/components/Wallet/Empty';
import { valueToBigNumber, BigNumber } from '@aave/protocol-js';

export default (props: any) => {
  const { match: { params: { underlyingAsset,id } } } = props

  const { wallet, balances } = useModel('wallet');
  const { reserves, user, baseCurrency } = useModel('pool')
  const balance = balances ? balances[underlyingAsset] : '0'

  const poolReserve = reserves.find((res) =>
        id? res.id === id : res.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
  );


  let walletBalance = valueToBigNumber('0').dividedBy(valueToBigNumber(10).pow(18))

  if(balance && poolReserve) {
    walletBalance = valueToBigNumber(balance).dividedBy(valueToBigNumber(10).pow(poolReserve.decimals))
  }

  const maxUserAmountToBorrow = valueToBigNumber(
    user?.availableBorrowsMarketReferenceCurrency || 0
  ).div(poolReserve?.priceInMarketReferenceCurrency);
  let maxAmountToBorrow = BigNumber.max(
    BigNumber.min(poolReserve?.availableLiquidity, maxUserAmountToBorrow),
    0
  );
  if (
    maxAmountToBorrow.gt(0) &&
    user?.totalBorrowsMarketReferenceCurrency !== '0' &&
    maxUserAmountToBorrow.lt(valueToBigNumber(poolReserve.availableLiquidity).multipliedBy('1.01'))
  ) {
    maxAmountToBorrow = maxAmountToBorrow.multipliedBy('0.99');
  }


  return (
    <GridContent>
      <Info
        items={[
          {
            title: 'You have borrowed',
            value: walletBalance.toString(),
          },
          {
            title: 'Total collateral',
            value: '6.92421 FUSDT',
          },
          {
            title: 'Loan value',
            value: '64.95%',
          },
          {
            title: 'Fitness factor',
            value: '14.95',
          }
        ]}
      />
      <Overview  poolReserve={poolReserve} marketRefPriceInUsd={baseCurrency.marketRefPriceInUsd} />

      {!wallet && <WalletDisconnected />}

      {wallet && walletBalance.eq('0') && <WalletEmpty symbol={poolReserve?poolReserve?.symbol:''} />}

      {wallet && !walletBalance.eq('0') && React.cloneElement(props.children, { poolReserve, maxAmountToBorrow: maxAmountToBorrow.toString(10) }) }
    </GridContent>
  );
};
