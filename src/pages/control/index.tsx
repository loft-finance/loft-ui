import React, { useRef, useState } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { Card, Row, Col, Button, Typography, Divider, Spin } from 'antd';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import { valueToBigNumber, InterestRate } from '@aave/protocol-js';
import { Pie } from '@ant-design/plots';
import { useModel, FormattedMessage } from 'umi';
const { Title } = Typography;
import styles from './index.less';
import DepositDashbord from '@/pages/deposit/dashboard'
import LoanDashboard from '@/pages/loan/dashboard'
import { loftToUsd, lpToUsd } from '@/lib/helpers/utils';
import Bignumber from '@/components/Bignumber';

export default () => {
  const { wallet } = useModel('wallet', res => ({
    wallet: res.wallet
  }));
  const { reserves, user } = useModel('pool', res=>({
    reserves: res.reserves,
    user: res.user
  }))
  const { reserveIncentives } = useModel('incentives', res=>({
    reserveIncentives: res.reserveIncentives
  }))

  const { 
    lpApy, depositedLp, earnedLp,
    loftApy, depositedLoft, earnedLoft,
  } = useModel('pledge', res => ({
    lpApy: res.lpApy,
    depositedLp: res.depositedLp,
    earnedLp: res.earnedLp,
    
    loftApy: res.loftApy,
    depositedLoft: res.depositedLoft,
    earnedLoft: res.earnedLoft,
  }))

  const [isLTVModalVisible, setLTVModalVisible] = useState(false);
  const [isBorrow, setIsBorrow] = useState(false);
  const [isDepositMobileInfoVisible, setDepositMobileInfoVisible] = useState(false);
  const [isBorrowMobileInfoVisible, setBorrowMobileInfoVisible] = useState(false);

  const maxBorrowAmount = valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0').plus(
    user?.availableBorrowsMarketReferenceCurrency || '0'
  );
  const collateralUsagePercent = maxBorrowAmount.eq(0)
    ? '1'
    : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0')
      .div(maxBorrowAmount)
      .toFixed();

  const loanToValue =
    user?.totalCollateralMarketReferenceCurrency === '0'
      ? '0'
      : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0')
        .dividedBy(user?.totalCollateralMarketReferenceCurrency || '1')
        .toFixed();

  const depositedPositions: any = [];
  const borrowedPositions: any = [];

  user?.userReservesData.forEach((userReserve) => {
    const poolReserve = reserves.find((res) => res.symbol === userReserve.reserve.symbol);
    if (!poolReserve) {
      // throw new Error('data is inconsistent pool reserve is not available');
    }

    const reserveIncentiveData = reserveIncentives[userReserve.reserve.underlyingAsset.toLowerCase()];

    if (userReserve.underlyingBalance !== '0' || userReserve.totalBorrows !== '0') {
      const baseListData = {
        // uiColor: getAssetColor(userReserve.reserve.symbol),
        symbol: poolReserve.symbol,
        isActive: poolReserve.isActive,
        isFrozen: poolReserve.isFrozen,
        stableBorrowRateEnabled: poolReserve.stableBorrowRateEnabled,
        reserve: {
          ...userReserve.reserve,
          liquidityRate: poolReserve.supplyAPY,
        },
      };
      if (userReserve.underlyingBalance !== '0') {
        depositedPositions.push({
          ...baseListData,
          borrowingEnabled: poolReserve.borrowingEnabled,
          avg30DaysLiquidityRate: poolReserve.avg30DaysLiquidityRate,
          usageAsCollateralEnabledOnThePool: poolReserve.usageAsCollateralEnabled,
          usageAsCollateralEnabledOnUser: userReserve.usageAsCollateralEnabledOnUser,
          underlyingBalance: userReserve.underlyingBalance,
          underlyingBalanceUSD: userReserve.underlyingBalanceUSD,
          aincentivesAPR: reserveIncentiveData
            ? reserveIncentiveData.aIncentives.incentiveAPR
            : '0',
          // onToggleSwitch: () =>
          //   toggleUseAsCollateral(
          //     history,
          //     poolReserve.id,
          //     !userReserve.usageAsCollateralEnabledOnUser,
          //     poolReserve.underlyingAsset
          //   ),
        });
      }

      if (userReserve.variableBorrows !== '0') {
        borrowedPositions.push({
          ...baseListData,
          borrowingEnabled: poolReserve.borrowingEnabled,
          currentBorrows: userReserve.variableBorrows,
          currentBorrowsUSD: userReserve.variableBorrowsUSD,
          borrowRateMode: InterestRate.Variable,
          borrowRate: poolReserve.variableBorrowAPY,
          vincentivesAPR: reserveIncentiveData
            ? reserveIncentiveData.vIncentives.incentiveAPR
            : '0',
          sincentivesAPR: reserveIncentiveData
            ? reserveIncentiveData.sIncentives.incentiveAPR
            : '0',
          avg30DaysVariableRate: poolReserve.avg30DaysVariableBorrowRate,
          // repayLink: loanActionLinkComposer(
          //   'repay',
          //   poolReserve.id,
          //   InterestRate.Variable,
          //   poolReserve.underlyingAsset
          // ),
          // borrowLink: loanActionLinkComposer(
          //   'borrow',
          //   poolReserve.id,
          //   InterestRate.Variable,
          //   poolReserve.underlyingAsset
          // ),
          // onSwitchToggle: () =>
          //   toggleBorrowRateMode(
          //     history,
          //     poolReserve.id,
          //     InterestRate.Variable,
          //     poolReserve.underlyingAsset
          //   ),
        });
      }
      if (userReserve.stableBorrows !== '0') {
        borrowedPositions.push({
          ...baseListData,
          borrowingEnabled: poolReserve.borrowingEnabled && poolReserve.stableBorrowRateEnabled,
          currentBorrows: userReserve.stableBorrows,
          currentBorrowsUSD: userReserve.stableBorrowsUSD,
          borrowRateMode: InterestRate.Stable,
          borrowRate: userReserve.stableBorrowAPY,
          vincentivesAPR: reserveIncentiveData
            ? reserveIncentiveData.vIncentives.incentiveAPR
            : '0',
          sincentivesAPR: reserveIncentiveData
            ? reserveIncentiveData.sIncentives.incentiveAPR
            : '0',
          // repayLink: loanActionLinkComposer(
          //   'repay',
          //   poolReserve.id,
          //   InterestRate.Stable,
          //   poolReserve.underlyingAsset
          // ),
          // borrowLink: loanActionLinkComposer(
          //   'borrow',
          //   poolReserve.id,
          //   InterestRate.Stable,
          //   poolReserve.underlyingAsset
          // ),
          // onSwitchToggle: () =>
          //   toggleBorrowRateMode(
          //     history,
          //     poolReserve.id,
          //     InterestRate.Stable,
          //     poolReserve.underlyingAsset
          //   ),
        });
      }
    }
  });


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
    <Spin spinning={!reserves || !reserves.length}>
      <GridContent>
        {!wallet && <WalletDisconnected showBack={false} />}
        {wallet && (
          <Row>
            <Col span={12} style={{ paddingRight: 10 }}>
              <Card bordered={false} style={{ height: '100%' }}>
                <Row>
                  <Col span={18}>
                    <Title level={3}><FormattedMessage id="pages.info.deposit.title" /></Title>
                  </Col>
                </Row>
                <Row style={{marginTop:35}}>
                  <Col span={12} style={{ marginTop: 20 }}>
                    <div className={styles.label}><FormattedMessage id="pages.info.deposit.balance" /></div>
                    <div className={styles.value}>
                      ${Number(user?.totalLiquidityUSD || 0).toFixed(2)}
                      <span className={styles.dollar}>{Number(user?.totalLiquidityMarketReferenceCurrency || 0).toFixed(2)} USD</span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Pie {...config} />
                    <div className={styles.tip} style={{ textAlign: 'center', fontSize: 10 }}>
                      <FormattedMessage id="pages.info.deposit.composition" />
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={12} style={{ paddingLeft: 10 }}>
              <Card bordered={false}>
                <Row>
                  <Col span={12}>
                    <Title level={3}><FormattedMessage id="pages.info.loan.title" /></Title>
                    <Row>
                      <Col span={24}>
                        <div className={styles.label}><FormattedMessage id="pages.info.loan.borrowed" /></div>
                        <div className={styles.value}>${Number(user?.totalBorrowsUSD || 0).toFixed(2)} USD</div>
                      </Col>
                      <Col span={24} style={{ marginTop: 15 }}>
                        <div className={styles.label}><FormattedMessage id="pages.info.loan.collateral" /></div>
                        <div className={styles.value}>${Number(user?.totalCollateralUSD || 0).toFixed(2)} USD</div>
                      </Col>
                      <Col span={24} style={{ marginTop: 15 }}>
                        <div className={styles.label}><FormattedMessage id="pages.info.loan.ltv" /></div>
                        <div className={styles.value}>5.41%</div>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={12}>
                    <Row style={{ marginTop: -10 }}>
                      <Col span={12}>
                        <Pie {...config} />
                        <div className={styles.tip} style={{ textAlign: 'center', fontSize: 10 }}>
                          <FormattedMessage id="pages.info.loan.composition" />
                        </div>
                      </Col>
                      <Col span={12}>
                        <Pie {...config3} />
                        <div className={styles.tip} style={{ textAlign: 'center', fontSize: 10 }}>
                          <FormattedMessage id="pages.info.loan.CollateralComposition" />
                        </div>
                      </Col>
                    </Row>
                    <Row style={{ paddingLeft: 15 }}>
                      <Col span={24} style={{ marginTop: 15 }}>
                        <div className={styles.label}><FormattedMessage id="pages.info.loan.FitnessFactor" /></div>
                        <div className={styles.value} style={{ color: '#37A967' }}>
                          {user?.healthFactor ? Number(user?.healthFactor).toFixed(2) : '-1'}
                        </div>
                      </Col>
                      <Col span={24} style={{ marginTop: 15 }}>
                        <div className={styles.label}><FormattedMessage id="pages.info.loan.capacity" /></div>
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
              </Row>
              <Row>
                <Col span={24}>
                  <Card bordered={false} bodyStyle={{ padding: '6px 12px' }}>
                    <Row>
                      <Col span={5} className={styles.single}>
                        {' '}
                        LOFT
                      </Col>
                      <Col span={3}>
                        <div className={styles.multi}>
                          <Bignumber value={earnedLoft} />
                          <div className={styles.tag}>$<Bignumber value={loftToUsd(earnedLoft)} /></div>
                        </div>
                      </Col>
                      <Col span={3} className={styles.single}>
                        <Bignumber value={loftApy} />%
                      </Col>
                      <Col span={4}>
                        <div className={styles.multi}>
                          <Bignumber value={depositedLoft} />
                          <div className={styles.tag}>$<Bignumber value={loftToUsd(depositedLoft)} /></div>
                        </div>
                      </Col>
                      {/* <Col span={4}>
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
                      </Col> */}
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
            <Col span={24} style={{ marginTop: 5 }} className={styles.statistic}>
              <Row style={{ padding: 12 }}>
                <Col span={12}>Stake Spookyswap LP tokens to earn GEIST rewards</Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Card bordered={false} bodyStyle={{ padding: '6px 12px' }}>
                    <Row>
                      <Col span={5} className={styles.single}> LP</Col>
                      <Col span={3}>
                        <div className={styles.multi}>
                          <Bignumber value={earnedLp} />
                          <div className={styles.tag}>$<Bignumber value={lpToUsd(earnedLp)} /></div>
                        </div>
                      </Col>
                      <Col span={3} className={styles.single}>
                        <Bignumber value={lpApy} />%
                      </Col>
                      <Col span={4}>
                        <div className={styles.multi}>
                          <Bignumber value={depositedLp} />
                          <div className={styles.tag}>$<Bignumber value={lpToUsd(depositedLp)} /></div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col span={12} style={{ marginTop: 15, paddingRight: 10 }}>
              <Card bordered={false}>
                <Row>
                  <Col span={18}>
                    <Title level={3}><FormattedMessage id="pages.dashboard.deposit.title" /></Title>
                  </Col>
                  <Col span={6}></Col>
                </Row>
                <DepositDashbord depositedPositions={depositedPositions} />
              </Card>
            </Col>
            <Col span={12} style={{ marginTop: 15, paddingLeft: 10 }}>
              <Card bordered={false}>
                <Row>
                  <Col span={18}>
                    <Title level={3}><FormattedMessage id="pages.dashboard.loan.title" /></Title>
                  </Col>
                  <Col span={6}></Col>
                </Row>
                <LoanDashboard borrowedPositions={borrowedPositions} />
              </Card>
            </Col>
          </Row>
        )}
      </GridContent>
    </Spin>
  );
};
