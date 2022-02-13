import React, { useRef, useState } from 'react';
import { Card, Row, Col, Button, Typography, Input, Divider, Form } from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import Info from '@/components/Info';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import { useModel, history } from 'umi';
const { Title } = Typography;
import styles from './index.less';

export default () => {
  const { initialState } = useModel('@@initialState');
  const { wallet } = initialState;

  return (
    <GridContent>
      <Info
        items={[
          {
            title: 'Pledge coin',
            value: '2.2M',
            tag: '($21.12MUSD)',
          },
          {
            title: 'Coin price',
            value: '$9.33',
          },
          {
            title: 'Fluidity',
            value: '5.3M',
            tag: '(28.5% LOCKED)',
          },
          {
            title: 'Market value',
            value: '$49.4M',
          },
        ]}
      />

      {!wallet && <WalletDisconnected showBack={false} />}
      {wallet && (
        <Row>
          <Col span={10}>
            <Card bordered={false}>
              <Row>
                <Col span={18}>
                  <Title level={3}>Stake GEIST</Title>
                </Col>
                <Col span={6}>APY 452.61%</Col>
              </Row>
              <Row>
                <Col span={24}>
                  <p className={styles.tip}>
                    Stake GEIST and earn platform fees with no lockup period.
                  </p>
                </Col>
                <Col span={24}>
                  <p className={styles.tip}>Wallet Balance:</p>
                  <p>0 GEIST</p>
                </Col>
              </Row>

              <Row className={styles.form}>
                <Col span={18}>
                  <Form name="basic" layout={'vertical'} autoComplete="off">
                    <Form.Item
                      name="quantity"
                      rules={[{ required: true, message: 'Please input quantity!' }]}
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder="Quantity"
                        prefix={<DollarCircleOutlined className="site-form-item-icon" />}
                        suffix={<a>Max</a>}
                      />
                    </Form.Item>
                  </Form>
                </Col>
                <Col span={5} offset={1}>
                  <Button type="primary" shape="round">
                    Stake
                  </Button>
                </Col>
              </Row>
            </Card>
            <Card bordered={false} style={{ marginTop: 15 }}>
              <Row>
                <Col span={18}>
                  <Title level={3}>Help</Title>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <p className={styles.tip}>
                    Looking for some help?Visit our docs or join our Telegram.
                  </p>
                </Col>
                <Col span={5} offset={19} style={{ marginTop: 18 }}>
                  <Button type="primary" shape="round">
                    Docs
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={13} offset={1}>
            <Card bordered={false}>
              <Row>
                <Col span={18}>
                  <Title level={3}>Unlocked GEIST</Title>
                </Col>
              </Row>
              <Row>
                <Col span={10}>
                  <p className={styles.tip}>
                    Looking for some help?Visit our docs or join our Telegram.
                  </p>
                </Col>
                <Col span={6} offset={1}>
                  20.902 GEIST
                </Col>
                <Col span={5} offset={1}>
                  <Button type="primary" shape="round">
                    Claim GEIST
                  </Button>
                </Col>
              </Row>
            </Card>
            <Card bordered={false} style={{ marginTop: 15 }}>
              <Row>
                <Col span={18}>
                  <Title level={3}>Platform fees</Title>
                </Col>
                <Col span={6}>
                  <Button type="primary" shape="round">
                    Claim all
                  </Button>
                </Col>
              </Row>
              <div className={styles.table}>
                <Row className={styles.head}>
                  <Col span={8}>Token</Col>
                  <Col span={8}>Amount</Col>
                </Row>
                <Divider style={{ margin: 5 }} />
                <Row className={styles.row}>
                  <Col span={8}> GEIST</Col>
                  <Col span={8}>1.40029</Col>
                  <Col span={8} className={styles.tag}>
                    $0 USD
                  </Col>
                </Row>
                <Row className={styles.row}>
                  <Col span={8}> GEIST</Col>
                  <Col span={8}>1.40029</Col>
                  <Col span={8} className={styles.tag}>
                    $0 USD
                  </Col>
                </Row>
                <Row className={styles.row}>
                  <Col span={8}> GEIST</Col>
                  <Col span={8}>1.40029</Col>
                  <Col span={8} className={styles.tag}>
                    $0 USD
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </GridContent>
  );
};
