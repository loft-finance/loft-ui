import React, { useRef, useState } from 'react';
import { useModel, FormattedMessage } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import Overview from './overview';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import WalletEmpty from '@/components/Wallet/Empty';
import Bignumber from '@/components/Bignumber';
import { valueToBigNumber, BigNumber } from '@aave/protocol-js';
import { fixedToValue } from '@/utils';

export default (props: any) => {
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
  const balance = balances ? balances[underlyingAsset] : '0'

  const poolReserve = reserves.find((res: any) =>
    id ? res.id === id : res.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
  );

  const underlyingSymbol = poolReserve?.symbol || ''
  let walletBalance = valueToBigNumber('0').dividedBy(valueToBigNumber(10).pow(18))

  if (balance && poolReserve) {
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

  const userReserve = user
    ? user.userReservesData.find((userReserve: any) =>
      id
        ? userReserve.reserve.id === id
        : userReserve.reserve.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
    )
    : undefined;
  const currentBorrows = userReserve ? valueToBigNumber(userReserve.totalBorrows).toString() : '0';

  return (
    <GridContent>
      <Info
        items={[
          {
            title: <FormattedMessage id="pages.loan.detail.info.borrowed" />,
            value: <>{fixedToValue(currentBorrows)} {underlyingSymbol}</>,
          },
          {
            title: <FormattedMessage id="pages.loan.detail.info.TotalCollateral" />,
            value: <><Bignumber value={user?.totalCollateralUSD} maximumValueDecimals={4} /> USD</>,
          },
          {
            title: <FormattedMessage id="pages.loan.detail.info.LoanValue" />,
            value: <Bignumber value={user?.currentLoanToValue} />,
          },
          {
            title: <FormattedMessage id="pages.loan.detail.info.FitnessFactor" />,
            value: <Bignumber value={user?.healthFactor || '-1'} />,
          }
        ]}
      />
      <Overview poolReserve={poolReserve} marketRefPriceInUsd={baseCurrency.marketRefPriceInUsd} />

      {!account && <WalletDisconnected />}

      {/* {wallet && maxAmountToBorrow.toString() == '0' && <WalletEmpty symbol={poolReserve ? poolReserve?.symbol : ''} />} */}

      {account && React.cloneElement(props.children, { poolReserve, userReserve, maxAmountToBorrow: maxAmountToBorrow.toString(10) })}
    </GridContent>
  );
};
