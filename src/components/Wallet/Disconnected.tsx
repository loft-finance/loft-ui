import { useEffect, useState, useRef } from 'react';
import { Card, Result, Button, Image } from 'antd';
import Back from '@/components/Back';
import Connect from '@/components/Wallet/Connect';

export default ({ showBack = true }) => {
  const connectRef = useRef();

  const handler = {
    connect() {
      connectRef.current.show();
    },
  };

  return (
    <>
      <Card bordered={false}>
        {showBack && <Back />}
        <Result
          icon={<Image width={70} preview={false} src="/ic_wallet@3x.png" />}
          title="Please connect a wallet"
          style={{}}
          subTitle="The wallet cannot be detected, please connect the wallet to deposit and check the balance growth"
          extra={
            <Button type="primary" style={{ width: 300 }} onClick={handler.connect}>
              connect
            </Button>
          }
        />
      </Card>
      <Connect refs={connectRef} />
    </>
  );
};
