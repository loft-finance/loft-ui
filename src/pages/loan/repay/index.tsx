import React from 'react';
import { useModel, FormattedMessage } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import WalletEmpty from '@/components/Wallet/Empty';
import { BigNumber, valueToBigNumber, InterestRate } from '@aave/protocol-js';
import { normalize } from '@aave/math-utils';
import { getNetwork } from '@/lib/helpers/provider';
import Bignumber from '@/components/Bignumber';
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
    const { currentMarket } = useModel('market', res => ({
        currentMarket: res.current
    }));

    const chainId = currentMarket.chainId
    const networkConfig = getNetwork(chainId);
    const debtType = InterestRate.Variable;

    const balance = balances ? balances[underlyingAsset] : '0'

    const poolReserve = reserves.find((res: any) => id ? res.id === id : res.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase());

    let walletBalance = valueToBigNumber('0').dividedBy(valueToBigNumber(10).pow(18))

    if (balance && poolReserve) {
        walletBalance = valueToBigNumber(balance).dividedBy(valueToBigNumber(10).pow(poolReserve?.decimals))
    }


    const marketRefPriceInUsd = normalize(baseCurrency?.marketReferenceCurrencyPriceInUsd || '0', 8)

    const walletBalanceUSD = valueToBigNumber(walletBalance)
        .multipliedBy(poolReserve?.priceInMarketReferenceCurrency)
        .multipliedBy(marketRefPriceInUsd);


    const userReserve = user
        ? user.userReservesData.find((userReserve: any) =>
            id
                ? userReserve.reserve.id === id
                : userReserve.reserve.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
        )
        : undefined;
    const normalizedWalletBalance = walletBalance.minus(
        userReserve?.reserve.symbol.toUpperCase() === networkConfig.baseAsset ? '0.004' : '0'
    );

    const maxAmountToRepay = BigNumber.min(
        normalizedWalletBalance,
        debtType == InterestRate.Stable ? userReserve?.stableBorrows : userReserve?.variableBorrows
    );

    return (
        <GridContent>
            <Info
                items={[
                    {
                        title: <FormattedMessage id="pages.loan.repay.info.balance" />,
                        value: fixedToValue(userReserve?.totalBorrows),
                        tag: <>({fixedToValue(userReserve?.totalBorrowsUSD)})</>,
                        span: 8,
                    },
                    {
                        title: <FormattedMessage id="pages.loan.repay.info.collateral" />,
                        value: <Bignumber value={user?.totalCollateralUSD || '0'} />,
                        tag: <>(<Bignumber value={user?.totalCollateralMarketReferenceCurrency || '0'} />)</>,
                        span: 8,
                    },
                    {
                        title: <FormattedMessage id="pages.loan.repay.info.FitnessFactor" />,
                        value: user?.healthFactor && Number(user?.healthFactor).toFixed(2) || '0',
                        span: 8,
                    },
                    {
                        title: <FormattedMessage id="pages.loan.repay.info.WalletBalance" />,
                        value: <Bignumber value={walletBalance || '0'} />,
                        tag: <>(<Bignumber value={walletBalanceUSD || '0'} />)</>,
                        span: 8,
                    },
                    {
                        title: <FormattedMessage id="pages.loan.repay.info.CollateralComposition" />,
                        value: <>3.5%</>,
                        span: 8,
                    },
                    {
                        title: <FormattedMessage id="pages.loan.repay.info.ratio" />,
                        value: <><Bignumber value={user?.currentLoanToValue || '0'} />%</>,
                        span: 8,
                    },
                ]}
            />

            {!account && <WalletDisconnected />}

            {/* {wallet && maxAmountToRepay.toString() == '0' && walletBalance.eq('0') && <WalletEmpty symbol={poolReserve ? poolReserve?.symbol : ''} />} */}

            {account && React.cloneElement(props.children, { poolReserve, user, userReserve, maxAmountToRepay, walletBalance, networkConfig, debtType })}
        </GridContent>
    );
};
