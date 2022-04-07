import React from 'react';
import { useModel, FormattedMessage } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import Bignumber from '@/components/Bignumber';

import WalletDisconnected from '@/components/Wallet/Disconnected';
import WalletEmpty from '@/components/Wallet/Empty';
import { BigNumber, valueToBigNumber } from '@aave/protocol-js';

export default (props: any) => {
    const { match: { params: { underlyingAsset, id } } } = props

    const { wallet, balances } = useModel('wallet', res => ({
        wallet: res.wallet,
        balances: res.balances
    }));
    const { reserves, user } = useModel('pool', res => ({
        reserves: res.reserves,
        user: res.user
    }))


    const balance = balances ? balances[underlyingAsset] : '0'

    const poolReserve = reserves.find((res: any) => id ? res.id === id : res.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase());

    const underlyingSymbol = poolReserve?.symbol || '';

    let walletBalance = valueToBigNumber('0').dividedBy(valueToBigNumber(10).pow(18))

    if (balance && poolReserve) {
        walletBalance = valueToBigNumber(balance).dividedBy(valueToBigNumber(10).pow(poolReserve?.decimals))
    }

    const userReserve = user
        ? user.userReservesData.find((userReserve: any) =>
            id
                ? userReserve.reserve.id === id
                : userReserve.reserve.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
        )
        : undefined;

    let maxUserAmountToWithdraw = BigNumber.min(
        userReserve?.underlyingBalance,
        poolReserve?.availableLiquidity
    ).toString(10);

    if (
        userReserve?.usageAsCollateralEnabledOnUser &&
        poolReserve?.usageAsCollateralEnabled &&
        userReserve?.totalBorrowsMarketReferenceCurrency !== '0'
    ) {
        // if we have any borrowings we should check how much we can withdraw without liquidation
        // with 0.5% gap to avoid reverting of tx
        let totalCollateralToWithdrawInETH = valueToBigNumber('0');
        const excessHF = valueToBigNumber(user?.healthFactor).minus('1');
        if (excessHF.gt('0')) {
            totalCollateralToWithdrawInETH = excessHF
                .multipliedBy(user?.totalBorrowsMarketReferenceCurrency)
                // because of the rounding issue on the contracts side this value still can be incorrect
                .div(Number(poolReserve?.reserveLiquidationThreshold) + 0.01)
                .multipliedBy('0.99');
        }
        maxUserAmountToWithdraw = BigNumber.min(
            maxUserAmountToWithdraw,
            totalCollateralToWithdrawInETH.dividedBy(poolReserve?.priceInMarketReferenceCurrency)
        ).toString();
    }

    maxUserAmountToWithdraw = BigNumber.max(maxUserAmountToWithdraw, 0).toString();

    return (
        <GridContent>
            <Info
                items={[
                    {
                        title: <FormattedMessage id="pages.deposit.withdraw.info.balance" />,
                        value: <><Bignumber value={userReserve?.underlyingBalance || '0'} /> {underlyingSymbol}</>,
                    },
                    {
                        title: <FormattedMessage id="pages.deposit.withdraw.info.FitnessFactor" />,
                        value: <Bignumber value={user?.healthFactor || '-1'} />,
                    },
                    {
                        title: <FormattedMessage id="pages.deposit.withdraw.info.LoanAppreciation" />,
                        value: <><Bignumber value={user?.currentLoanToValue || '0'} /> %</>,
                    },
                    {
                        title: <FormattedMessage id="pages.deposit.withdraw.info.collateral" />,
                        value: '14.95%',
                    },
                ]}
            />

            {!wallet && <WalletDisconnected />}

            {/* {wallet && maxUserAmountToWithdraw == '0' && <WalletEmpty symbol={poolReserve ? poolReserve?.symbol : ''} />} */}

            {wallet && React.cloneElement(props.children, { poolReserve, user, userReserve, maxUserAmountToWithdraw: maxUserAmountToWithdraw.toString() })}
        </GridContent>
    );
};
