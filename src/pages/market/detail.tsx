import React, { useRef, useState } from 'react';
import { useModel } from 'umi';
import { Card, Row, Col, Button, Switch } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import { Pie } from '@ant-design/plots';
import styles from './detail.less';

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
    with: 200,
    height: 200,
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
      content: {
        customHtml: (container, view, datum, data) => {
          const { width } = container.getBoundingClientRect();
          return `<img style="width:${
            (3 * width) / 4
          }px; border-radius:50%;" src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.ccvalue.cn%2Fupload%2F2020%2F0217%2F3f5dae19531be0617b6dc6a966d60c08.jpg&refer=http%3A%2F%2Fwww.ccvalue.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1647253782&t=ebc9ea3e23e24cf30dd232075f6551aa" />`;
        },
      },
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

  return (
    <GridContent>
      <div className={styles.alert}>
        Please confirm you installed Metamask and selected Binance Smart Chain Network.
      </div>
      <Row>
        <Col span={16} style={{ paddingRight: 10 }}>
          <div className={styles.title}>Reserve status & configuration</div>
          <Row>
            <Col span={24}>
              <Card bordered={false}>
                <Row>
                  <Col span={8}>
                    <Pie {...config} />
                  </Col>
                  <Col span={16}>
                    <Row>
                      <Col span={12}>
                        <div className={styles.legend}>
                          <div className={styles.name}>
                            <span
                              className={styles.dot}
                              style={{ backgroundColor: '#26A984' }}
                            ></span>
                            Total borrowings
                          </div>
                          <div className={styles.amount}>6,924,248,361.48</div>
                          <div className={styles.value}>$2.297.125.368.54</div>
                          <div className={styles.card}>
                            <div className={styles.name}>Reserve scale</div>
                            <div className={styles.value}>$ 2.588,119,008.48</div>
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className={styles.legend}>
                          <div className={styles.name}>
                            <span
                              className={styles.dot}
                              style={{ backgroundColor: '#7BDBBF' }}
                            ></span>
                            Total borrowings
                          </div>
                          <div className={styles.amount}>6,924,248,361.48</div>
                          <div className={styles.value}>$2.297.125.368.54</div>
                          <div className={styles.card}>
                            <div className={styles.name}>Reserve scale</div>
                            <div className={styles.value}>$ 2.588,119,008.48</div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row style={{ marginTop: 15 }}>
                  <Col span={12} style={{ paddingRight: 5 }}>
                    <Card
                      title="Deposit"
                      className="CardInfo"
                      headStyle={{ textAlign: 'center', backgroundColor: '#ECF3FF', height: 38 }}
                      bodyStyle={{ padding: '15px 15px 5px' }}
                    >
                      <Row className={styles.CardInfo}>
                        <Col span={12} className={styles.label}>
                          Deposit APY (Annual Yield)
                        </Col>
                        <Col span={12} className={styles.value}>
                          1.74%
                        </Col>
                        <Col span={12} className={styles.label}>
                          Average of the past 30 days
                        </Col>
                        <Col span={12} className={styles.value}>
                          —
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                  <Col span={12} style={{ paddingLeft: 5 }}>
                    <Card
                      title="Variable borrowing"
                      className="CardInfo"
                      headStyle={{ textAlign: 'center', backgroundColor: '#ECF3FF', height: 38 }}
                      bodyStyle={{ padding: '15px 15px 5px' }}
                    >
                      <Row className={styles.CardInfo}>
                        <Col span={12} className={styles.label}>
                          Borrow APY
                        </Col>
                        <Col span={12} className={styles.value}>
                          1.74%
                        </Col>
                        <Col span={12} className={styles.label}>
                          Average of the past 30 days
                        </Col>
                        <Col span={12} className={styles.value}>
                          —
                        </Col>
                        <Col span={12} className={styles.label}>
                          Percentage of total
                        </Col>
                        <Col span={12} className={styles.value}>
                          100%
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
                <Row style={{ marginTop: 15 }} className={styles.info}>
                  <Col span={6}>
                    <div className={styles.label}>Max LTV</div>
                    <div className={styles.value}>50.00%</div>
                  </Col>
                  <Col span={6}>
                    <div className={styles.label}>Liquidation threshold</div>
                    <div className={styles.value}>65.00%</div>
                  </Col>
                  <Col span={6}>
                    <div className={styles.label}>Liquidation penalty</div>
                    <div className={styles.value}>10.00%</div>
                  </Col>
                  <Col span={6}>
                    <div className={styles.label}>Used as collatera</div>
                    <div className={styles.bool}>yes</div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col span={8}>
          <div className={styles.title}>Your message</div>
          {!wallet && <WalletDisconnected showBack={false} />}

          {wallet && (
            <Row>
              <Col span={24}>
                <Card bordered={false}>
                  <Row>
                    <Col span={24}>
                      <Row>
                        <Col span={6}>deposit</Col>
                        <Col span={18} style={{ textAlign: 'right' }}>
                          <Button size="small" type="primary" shape="round">
                            deposit
                          </Button>
                          <Button size="small" shape="round" style={{ marginLeft: 8 }}>
                            withdrawal
                          </Button>
                        </Col>
                      </Row>
                      <Row className={styles.msg}>
                        <Col span={12} className={styles.label}>
                          Your wallet balance
                        </Col>
                        <Col span={12} className={styles.value}>
                          150.00 USDT
                        </Col>
                        <Col span={12} className={styles.label}>
                          You have deposited
                        </Col>
                        <Col span={12} className={styles.value}>
                          150.01 USDT
                        </Col>
                        <Col span={12} className={styles.label}>
                          Used as collateral
                        </Col>
                        <Col span={12} className={styles.value}>
                          No <Switch />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={24}>
                <Card bordered={false} style={{ marginTop: 10 }}>
                  <Row>
                    <Col span={24}>
                      <Row>
                        <Col span={6}>loan</Col>
                        <Col span={18} style={{ textAlign: 'right' }}>
                          <Button size="small" type="primary" shape="round">
                            loan
                          </Button>
                        </Col>
                      </Row>
                      <Row className={styles.msg}>
                        <Col span={12} className={styles.label}>
                          Borrowed
                        </Col>
                        <Col span={12} className={styles.value}>
                          0.00 USDT
                        </Col>
                        <Col span={12} className={styles.label}>
                          Fitness factor
                        </Col>
                        <Col span={12} className={styles.value}>
                          {' '}
                          —
                        </Col>
                        <Col span={12} className={styles.label}>
                          Loan appreciation
                        </Col>
                        <Col span={12} className={styles.value}>
                          80%
                        </Col>
                        <Col span={12} className={styles.label}>
                          Available
                        </Col>
                        <Col span={12} className={styles.value}>
                          48.04 USDT
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={24}>
                <Row style={{ marginTop: 15, padding: '0 24px' }}>
                  <Col span={8}>Your loan</Col>
                  <Col span={8}>Borrowed</Col>
                </Row>
                <Card
                  bordered={false}
                  bodyStyle={{ paddingTop: 3, paddingBottom: 3 }}
                  style={{ marginTop: 10 }}
                >
                  <Row className={styles.loan}>
                    <Col span={8} className={styles.label}>
                      FUSDT
                    </Col>
                    <Col span={6} className={styles.value}>
                      <div>6.929</div>
                      <div className={styles.tag}>$6.93</div>
                    </Col>
                    <Col span={9} offset={1} className={styles.label}>
                      <Button size="small" type="primary" shape="round">
                        loan
                      </Button>
                      <Button size="small" shape="round" style={{ marginLeft: 8 }}>
                        repay
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </GridContent>
  );
};
