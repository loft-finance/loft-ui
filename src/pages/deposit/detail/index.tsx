import React, { useRef, useState } from 'react';
import { useModel, FormattedMessage } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import Overview from './overview';
import Bignumber from '@/components/Bignumber';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import WalletEmpty from '@/components/Wallet/Empty';
import { BigNumber, valueToBigNumber } from '@aave/protocol-js';
import { getAssetInfo } from '@/lib/config/assets'
import { getNetwork } from '@/lib/helpers/provider';
import { fixedToValue } from '@/utils';


export default (props: { children?: any; match?: any; }) => {
  const { match: { params: { underlyingAsset, id } } } = props

  const { account, balances } = useModel('wallet', res => ({
    account: res.account,
    balances: res.balances
  }));

  const { reserves, user, baseCurrency } = useModel('pool', res => ({
    reserves: res.reserves,
    user: res.user,
    baseCurrency: res.baseCurrency
  }))

  const { currentMarket } = useModel('market', res => ({
    currentMarket: res.current
  }));

  const balance = balances ? balances[underlyingAsset] : '0'


  const poolReserve = reserves.find((res: any) =>
    id ? res.id === id : res.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
  );
  const underlyingSymbol = poolReserve?.symbol || ''
  const asset = getAssetInfo(id);

  const chainId = currentMarket.chainId
  const networkConfig = getNetwork(chainId);

  let walletBalance = valueToBigNumber('0').dividedBy(valueToBigNumber(10).pow(18))

  if (balance && poolReserve) {
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
    ? user.userReservesData.find((userReserve: any) =>
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
            title: <FormattedMessage id="pages.deposit.detail.info.balance" />,
            value: <>{fixedToValue(userReserve?.underlyingBalance)} {underlyingSymbol}</>,
          },
          {
            title: <FormattedMessage id="pages.deposit.detail.info.WalletBalance" />,
            value: <><Bignumber value={walletBalance} /> {underlyingSymbol}</>,
          },
          {
            title: <FormattedMessage id="pages.deposit.detail.info.FitnessFactor" />,
            value: user?.healthFactor ? Number(user?.healthFactor).toFixed(2) : '--',
          },
        ]}
      />
      <Overview poolReserve={poolReserve} marketRefPriceInUsd={baseCurrency.marketRefPriceInUsd} />

      {!account && <WalletDisconnected />}

      {/* {wallet && maxAmountToDeposit.toString() == '0' && walletBalance.eq('0') && <WalletEmpty symbol={poolReserve ? poolReserve?.symbol : ''} />} */}

      {account && React.cloneElement(props.children, { poolReserve, userReserve, maxAmountToDeposit: maxAmountToDeposit.toString(10) })}
    </GridContent>
  );
};
