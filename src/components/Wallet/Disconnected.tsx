import { useEffect, useState, useRef } from 'react';
import { Card, Result, Button, Image } from 'antd';
import Back from '@/components/Back';
import Connect from '@/components/Wallet/Connect';

export default ({ showBack = true, subTitle = 'To see your supplies / borrowed assets, you need to connect your wallet.' }) => {
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
          title="Please,connect your wallet"
          style={{}}
          subTitle={subTitle}
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
