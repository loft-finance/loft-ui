import React from 'react';
import { useModel } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import WalletEmpty from '@/components/Wallet/Empty';
import { BigNumber, valueToBigNumber, InterestRate } from '@aave/protocol-js';
import { getNetwork } from '@/lib/helpers/provider';

export default (props) => {
    const { match: { params: { underlyingAsset, id } } } = props

    const { wallet, balances } = useModel('wallet');
    const { reserves, user } = useModel('pool')
    const { current: currentMarket } = useModel('market');

    const chainId = currentMarket.chainId
    const networkConfig = getNetwork(chainId);
    const debtType = InterestRate.Variable;

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

            {wallet && !walletBalance.eq('0') && React.cloneElement(props.children, { poolReserve, user, userReserve, maxAmountToRepay, walletBalance, networkConfig, debtType })}
        </GridContent>
    );
};
