import React, { useRef, useState } from 'react';
import { Card, Row, Col, Button } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import { useModel } from 'umi';

export default () => {
  const { wallet } = useModel('wallet');

  return (
    <GridContent>
      <Info
        items={[
          {
            title: 'Funds in SM',
            value: '$ 0.00 USD',
          },
        ]}
      />

      <Row>
        <Col span={16}>{!wallet && <WalletDisconnected showBack={false} />}</Col>
        <Col span={7} offset={1}>
          <Row>
            <Col span={24}>
              <Card bordered={false}>
                <Row>
                  <Col span={24}>
                    <Button type="primary" block>
                      Unstake
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </GridContent>
  );
};
