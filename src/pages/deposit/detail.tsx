import React, { useRef, useState } from 'react';
import { useModel } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import Overview from '@/components/Overview';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import WalletEmpty from '@/components/Wallet/Empty';
import Deposit from '@/components/Wallet/Deposit';

export default () => {
  const { initialState } = useModel('@@initialState');
  const { wallet } = initialState;

  return (
    <GridContent>
      <Info
        items={[
          {
            title: 'Your balance in Aave',
            value: '--',
          },
          {
            title: 'Your wallet balance',
            value: '6.92421 FUSDT',
          },
        ]}
      />
      <Overview />

      {!wallet && <WalletDisconnected />}

      {wallet && !wallet.balance && <WalletEmpty />}

      {wallet && wallet.balance > 0 && <Deposit wallet={wallet} />}
    </GridContent>
  );
};
