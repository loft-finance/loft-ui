import React, { useRef, useState } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { Card, Row, Col, Button, Typography, Divider, Switch } from 'antd';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import { Pie } from '@ant-design/plots';
import { useModel, history } from 'umi';
const { Title } = Typography;
import styles from './index.less';

export default () => {
  const { initialState } = useModel('@@initialState');
  const { wallet } = initialState;

  const data = [
    {
      type: 'Total borrowings',
      value: 14,
    },
    {
      type: 'Total',
      value: 74,
    },
  ];
  const config = {
    appendPadding: 10,
    data,
    with: 80,
    height: 80,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '',
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: false,
      content: '',
    },
    legend: false,
    theme: {
      colors10: [
        '#7BDBBF',
        '#26A984',
        '#FFC100',
        '#9FB40F',
        '#76523B',
        '#DAD5B5',
        '#0E8E89',
        '#E19348',
        '#F383A2',
        '#247FEA',
      ],
    },
  };

  const config3 = {
    ...config,
    data: [
      {
        type: 'Total',
        value: 14,
      },
      {
        type: 'Total 1',
        value: 12,
      },
      {
        type: 'Total 2',
        value: 67,
      },
    ],
    theme: {
      colors10: [
        '#C54F01',
        '#FFD942',
        '#F68F33',
        '#9FB40F',
        '#76523B',
        '#DAD5B5',
        '#0E8E89',
        '#E19348',
        '#F383A2',
        '#247FEA',
      ],
    },
  };

  return (
    <GridContent>
      {!wallet && <WalletDisconnected showBack={false} />}
      {wallet && (
        <Row>
          <Col span={12} style={{ paddingRight: 10 }}>
            <Card bordered={false} style={{ height: '100%' }}>
              <Row>
                <Col span={18}>
                  <Title level={3}>Deposit information</Title>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ marginTop: 20 }}>
                  <div className={styles.label}>Approximate balance</div>
                  <div className={styles.value}>
                    $128.179
                    <span className={styles.dollar}>6722323 USD</span>
                  </div>
                </Col>
                <Col span={12}>
                  <Pie {...config} />
                  <div className={styles.tip} style={{ textAlign: 'center', fontSize: 10 }}>
                    Deposit composition
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12} style={{ paddingLeft: 10 }}>
            <Card bordered={false}>
              <Row>
                <Col span={12}>
                  <Title level={3}>Loan information</Title>
                  <Row>
                    <Col span={24}>
                      <div className={styles.label}>Borrowed</div>
                      <div className={styles.value}>$6.23 USD</div>
                    </Col>
                    <Col span={24} style={{ marginTop: 15 }}>
                      <div className={styles.label}>Your collateral</div>
                      <div className={styles.value}>$128.23 USD</div>
                    </Col>
                    <Col span={24} style={{ marginTop: 15 }}>
                      <div className={styles.label}>Current LTV</div>
                      <div className={styles.value}>5.41%</div>
                    </Col>
                  </Row>
                </Col>
                <Col span={12}>
                  <Row style={{ marginTop: -10 }}>
                    <Col span={12}>
                      <Pie {...config} />
                      <div className={styles.tip} style={{ textAlign: 'center', fontSize: 10 }}>
                        Loan composition
                      </div>
                    </Col>
                    <Col span={12}>
                      <Pie {...config3} />
                      <div className={styles.tip} style={{ textAlign: 'center', fontSize: 10 }}>
                        Collateral composition
                      </div>
                    </Col>
                  </Row>
                  <Row style={{ paddingLeft: 15 }}>
                    <Col span={24} style={{ marginTop: 15 }}>
                      <div className={styles.label}>Fitness factor</div>
                      <div className={styles.value} style={{ color: '#37A967' }}>
                        13.8
                      </div>
                    </Col>
                    <Col span={24} style={{ marginTop: 15 }}>
                      <div className={styles.label}>Used borrowing capacity</div>
                      <div className={styles.value}>10.23%</div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={24} style={{ marginTop: 15 }} className={styles.statistic}>
            <Row style={{ padding: 12 }}>
              <Col span={5}>Lend borrow to earn GEIST rewards</Col>
              <Col span={3}>Earned</Col>
              <Col span={3}>APY</Col>
              <Col span={4}>Your stacked balance</Col>
              <Col span={4}>Your locked balance</Col>
            </Row>
            <Row>
              <Col span={24}>
                <Card bordered={false} bodyStyle={{ padding: '6px 12px' }}>
                  <Row>
                    <Col span={5} className={styles.single}>
                      {' '}
                      GEIST
                    </Col>
                    <Col span={3}>
                      <div className={styles.multi}>
                        0.015
                        <div className={styles.tag}>$0.138</div>
                      </div>
                    </Col>
                    <Col span={3} className={styles.single}>
                      8,178.59%
                    </Col>
                    <Col span={4}>
                      <div className={styles.multi}>
                        20.904
                        <div className={styles.tag}>$194.234</div>
                      </div>
                    </Col>
                    <Col span={4}>
                      <Row>
                        <Col span={6} style={{ textAlign: 'right' }}>
                          <div className={styles.multi}>
                            0<div className={styles.tag}>$0</div>
                          </div>
                        </Col>
                        <Col span={12} className={styles.single}>
                          <Divider type="vertical" />
                          5.132%
                        </Col>
                      </Row>
                    </Col>
                    <Col span={2} className={styles.single}>
                      $0 USD
                    </Col>
                    <Col span={3} className={styles.single}>
                      <Button size="small" type="primary" shape="round">
                        To trade coins
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col span={24} style={{ marginTop: 5 }}>
            <Row style={{ padding: 12 }}>
              <Col span={12}>Stake Spookyswap LP tokens to earn GEIST rewards</Col>
            </Row>
            <Row>
              <Col span={24}>
                <Card bordered={false} bodyStyle={{ padding: 12 }}>
                  <Row>
                    <Col span={5}> GEIST</Col>
                    <Col span={3}>0</Col>
                    <Col span={3}>8,178.59%</Col>
                    <Col span={4}>0</Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col span={12} style={{ marginTop: 15, paddingRight: 10 }}>
            <Card bordered={false}>
              <Row>
                <Col span={18}>
                  <Title level={3}>Your deposit</Title>
                </Col>
                <Col span={6}></Col>
              </Row>
              <div className={styles.table}>
                <Row className={styles.head}>
                  <Col span={7}>current balance</Col>
                  <Col span={7}>Annual rate of return</Col>
                  <Col span={3}>Collateral</Col>
                </Row>
                <Row className={styles.row}>
                  <Col span={2} className={styles.single}>
                    GEIST
                  </Col>
                  <Col span={5}>
                    <div className={styles.multi}>
                      20.904
                      <div className={styles.tag}>$194.234</div>
                    </div>
                  </Col>
                  <Col span={7} className={styles.single}>
                    9.23
                  </Col>
                  <Col span={3} className={styles.single}>
                    <Switch defaultChecked checkedChildren="yes" unCheckedChildren="no" />
                  </Col>
                  <Col span={7} className={styles.single}>
                    <Button size="small" type="primary" shape={'round'} style={{ marginLeft: 5 }}>
                      deposit
                    </Button>
                    <Button size="small" shape={'round'} style={{ marginLeft: 5 }}>
                      withdraw
                    </Button>
                  </Col>
                </Row>
                <Row className={styles.row}>
                  <Col span={2} className={styles.single}>
                    GEIST
                  </Col>
                  <Col span={5}>
                    <div className={styles.multi}>
                      20.904
                      <div className={styles.tag}>$194.234</div>
                    </div>
                  </Col>
                  <Col span={7} className={styles.single}>
                    9.23
                  </Col>
                  <Col span={3} className={styles.single}>
                    <Switch defaultChecked checkedChildren="yes" unCheckedChildren="no" />
                  </Col>
                  <Col span={7} className={styles.single}>
                    <Button size="small" type="primary" shape={'round'} style={{ marginLeft: 5 }}>
                      deposit
                    </Button>
                    <Button size="small" shape={'round'} style={{ marginLeft: 5 }}>
                      withdraw
                    </Button>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={12} style={{ marginTop: 15, paddingLeft: 10 }}>
            <Card bordered={false}>
              <Row>
                <Col span={18}>
                  <Title level={3}>Your loan</Title>
                </Col>
                <Col span={6}></Col>
              </Row>
              <div className={styles.table}>
                <Row className={styles.head}>
                  <Col span={7}>current balance</Col>
                  <Col span={7}>Annual rate of return</Col>
                  <Col span={3}>Collateral</Col>
                </Row>
                <Row className={styles.row}>
                  <Col span={2} className={styles.single}>
                    GEIST
                  </Col>
                  <Col span={5}>
                    <div className={styles.multi}>
                      20.904
                      <div className={styles.tag}>$194.234</div>
                    </div>
                  </Col>
                  <Col span={7} className={styles.single}>
                    9.23
                  </Col>
                  <Col span={3} className={styles.single}>
                    <Switch defaultChecked checkedChildren="yes" unCheckedChildren="no" />
                  </Col>
                  <Col span={7} className={styles.single}>
                    <Button size="small" type="primary" shape={'round'} style={{ marginLeft: 5 }}>
                      loan
                    </Button>
                    <Button size="small" shape={'round'} style={{ marginLeft: 5 }}>
                      repay
                    </Button>
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