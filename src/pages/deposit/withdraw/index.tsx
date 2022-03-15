import React from 'react';
import { useModel } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';

import WalletDisconnected from '@/components/Wallet/Disconnected';
import WalletEmpty from '@/components/Wallet/Empty';
import { BigNumber, valueToBigNumber } from '@aave/protocol-js';

export default (props) => {
    const { match: { params: { underlyingAsset, id } } } = props

    const { wallet, balances } = useModel('wallet');
    const { reserves, user } = useModel('pool')


    const balance = balances ? balances[underlyingAsset] : '0'

    const poolReserve = reserves.find((res) => id ? res.id === id : res.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase());

    let walletBalance = valueToBigNumber('0').dividedBy(valueToBigNumber(10).pow(18))

    if (balance && poolReserve) {
        walletBalance = valueToBigNumber(balance).dividedBy(valueToBigNumber(10).pow(poolReserve?.decimals))
    }

    const userReserve = user
        ? user.userReservesData.find((userReserve) =>
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
                        title: 'Your balance in the platform',
                        value: walletBalance.toString(),
                    },
                    {
                        title: 'Fitness factor',
                        value: '14.95',
                    },
                    {
                        title: 'Loan appreciation',
                        value: '52.15%',
                    },
                    {
                        title: 'Collateral composition',
                        value: '14.95',
                    },
                ]}
            />

            {!wallet && <WalletDisconnected />}

            {wallet && walletBalance.eq('0') && <WalletEmpty symbol={poolReserve ? poolReserve?.symbol : ''} />}

            {wallet && !walletBalance.eq('0') && React.cloneElement(props.children, { poolReserve, user, userReserve, maxUserAmountToWithdraw: maxUserAmountToWithdraw.toString(10) })}
        </GridContent>
    );
};
