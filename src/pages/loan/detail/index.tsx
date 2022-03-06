import React, { useRef, useState } from 'react';
import { useModel } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import Overview from './overview';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import WalletEmpty from '@/components/Wallet/Empty';
import { valueToBigNumber, BigNumber, InterestRate } from '@aave/protocol-js';
import { getAssetInfo } from '@/lib/config/assets'
import { networks } from '@/lib/config/networks';
import { ChainId } from '@aave/contract-helpers';

export default (props) => {
  const { match: { params: { underlyingAsset,id } }, children } = props

  const { wallet, balances } = useModel('wallet');
  const { reserves, user, baseCurrency } = useModel('pool')
  const { current: currentMarket } = useModel('market');

  const balance = balances ? balances[underlyingAsset] : '0'

  const poolReserve = reserves.find((res) =>
        id? res.id === id : res.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
  );
  const asset = getAssetInfo(id);

  const getNetwork = (chainId: ChainId) => {
      const config = networks[chainId];
      if (!config) {
          throw new Error(`Network with chainId "${chainId}" was not configured`);
      }
      return { ...config };
  }

  const chainId = currentMarket.chainId
  const networkConfig = getNetwork(chainId);

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
