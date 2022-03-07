import { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import { Card, Row, Col, Button, Switch, Spin } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import { Pie } from '@ant-design/plots';
import { valueToBigNumber } from '@aave/protocol-js';
import styles from './detail.less';

export default (props: any) => {
  const { match: { params: { underlyingAsset,id } } } = props

  const { wallet } = useModel('wallet')
  const { reserves, user, baseCurrency } = useModel('pool')
  const poolReserve = reserves.find((res) =>
        id? res.id === id : res.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
      );
  const marketRefPriceInUsd = baseCurrency?.marketRefPriceInUsd;
  const totalLiquidityInUsd = valueToBigNumber(poolReserve?.totalLiquidity)
      .multipliedBy(poolReserve?.priceInMarketReferenceCurrency)
      .multipliedBy(marketRefPriceInUsd)
      .toString();
    const totalBorrowsInUsd = valueToBigNumber(poolReserve?.totalDebt)
      .multipliedBy(poolReserve?.priceInMarketReferenceCurrency)
      .multipliedBy(marketRefPriceInUsd)
      .toString();
    const availableLiquidityInUsd = valueToBigNumber(poolReserve?.availableLiquidity)
      .multipliedBy(poolReserve?.priceInMarketReferenceCurrency)
      .multipliedBy(marketRefPriceInUsd)
      .toString();


  const userReserve = user
        ? user.userReservesData.find((userReserve) =>
            id
              ? userReserve.reserve.id === id
              : userReserve.reserve.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
          )
        : undefined;
    const totalBorrows = valueToBigNumber(userReserve?.totalBorrows || '0').toNumber();
    const underlyingBalance = valueToBigNumber(userReserve?.underlyingBalance || '0').toNumber();

    const availableBorrowsMarketReferenceCurrency = valueToBigNumber(
      user?.availableBorrowsMarketReferenceCurrency || 0
    );
    const availableBorrows = availableBorrowsMarketReferenceCurrency.gt(0)
      ? BigNumber.min(
          availableBorrowsMarketReferenceCurrency
            .div(poolReserve?.priceInMarketReferenceCurrency)
            .multipliedBy(user && user.totalBorrowsMarketReferenceCurrency !== '0' ? '0.99' : '1'),
          poolReserve?.availableLiquidity
        ).toNumber()
      : 0;

  const [data, setData] = useState<any>({})

  useEffect(() => {
    if(id){
      const { marketReferenceCurrencyPriceInUsd: marketRefPriceInUsd } = baseCurrency
      const poolReserve = reserves.find((res: any) => res.id === id)

      if(poolReserve){
        const totalLiquidityInUsd = valueToBigNumber(poolReserve?.totalLiquidity)
          .multipliedBy(poolReserve?.priceInMarketReferenceCurrency)
          .multipliedBy(marketRefPriceInUsd)
          .toString();
        const totalBorrowsInUsd = valueToBigNumber(poolReserve?.totalDebt)
          .multipliedBy(poolReserve?.priceInMarketReferenceCurrency)
          .multipliedBy(marketRefPriceInUsd)
          .toString();
        const availableLiquidityInUsd = valueToBigNumber(poolReserve?.availableLiquidity)
          .multipliedBy(poolReserve?.priceInMarketReferenceCurrency)
          .multipliedBy(marketRefPriceInUsd)
          .toString();

        const data = {
          totalLiquidityInUsd,
          totalBorrowsInUsd,
          availableLiquidityInUsd,
          totalLiquidity: poolReserve?.totalLiquidity,
          totalBorrows: poolReserve?.totalDebt,
          availableLiquidity: poolReserve?.availableLiquidity,
          supplyAPY: Number(poolReserve?.supplyAPY),
          supplyAPR: Number(poolReserve?.supplyAPR),
          avg30DaysLiquidityRate: Number(poolReserve?.avg30DaysLiquidityRate),
          stableAPY: Number(poolReserve?.stableBorrowAPY),
          stableAPR: Number(poolReserve?.stableBorrowAPR),
          variableAPY: Number(poolReserve?.variableBorrowAPY),
          variableAPR: Number(poolReserve?.variableBorrowAPR),
          stableOverTotal: valueToBigNumber(poolReserve?.totalStableDebt)
            .dividedBy(poolReserve?.totalDebt)
            .toNumber(),
          variableOverTotal: valueToBigNumber(poolReserve?.totalVariableDebt)
            .dividedBy(poolReserve?.totalDebt)
            .toNumber(),
          avg30DaysVariableRate: Number(poolReserve?.avg30DaysVariableBorrowRate),
          utilizationRate: Number(poolReserve?.utilizationRate),
          baseLTVasCollateral: Number(poolReserve?.baseLTVasCollateral),
          liquidationThreshold: Number(poolReserve?.reserveLiquidationThreshold),
          liquidationBonus: Number(poolReserve?.reserveLiquidationBonus),
          usageAsCollateralEnabled: poolReserve?.usageAsCollateralEnabled,
          stableBorrowRateEnabled: poolReserve?.stableBorrowRateEnabled,
          borrowingEnabled: poolReserve?.borrowingEnabled,
        };

        setData(data)
      }
    }
  },[id])

  const config = {
    appendPadding: 10,
    data: [
      {
        type: 'Total borrowings',
        value: Number(Number(data.availableLiquidity).toFixed(2)),
      },
      {
        type: 'Total',
        value: Number(Number(data.totalBorrows).toFixed(2)),
      },
    ],
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
        {!!poolReserve &&
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
                          <div className={styles.amount}>{Number(data.totalBorrows).toFixed(2)}</div>
                          <div className={styles.value}>${Number(data.totalBorrowsInUsd).toFixed(2)}</div>
                          <div className={styles.card}>
                            <div className={styles.name}>Reserve scale</div>
                            <div className={styles.value}>$ {Number(data.totalLiquidityInUsd).toFixed(2)}</div>
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
                          <div className={styles.amount}>{Number(data.availableLiquidity).toFixed(2)}</div>
                          <div className={styles.value}>${Number(data.availableLiquidityInUsd).toFixed(2)}</div>
                          <div className={styles.card}>
                            <div className={styles.name}>Reserve scale</div>
                            <div className={styles.value}>$ {Number(data.totalBorrows).toFixed(2)}</div>
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
                          {data.supplyAPY}%
                        </Col>
                        <Col span={12} className={styles.label}>
                          Average of the past 30 days
                        </Col>
                        <Col span={12} className={styles.value}>
                          {data.supplyAPR}
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
                          {data.variableAPY}%
                        </Col>
                        <Col span={12} className={styles.label}>
                          Average of the past 30 days
                        </Col>
                        <Col span={12} className={styles.value}>
                          {data.variableAPR}
                        </Col>
                        <Col span={12} className={styles.label}>
                          Percentage of total
                        </Col>
                        <Col span={12} className={styles.value}>
                          {data.variableOverTotal}%
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
                <Row style={{ marginTop: 15 }} className={styles.info}>
                  <Col span={6}>
                    <div className={styles.label}>Max LTV</div>
                    <div className={styles.value}>{data.baseLTVasCollateral}%</div>
                  </Col>
                  <Col span={6}>
                    <div className={styles.label}>Liquidation threshold</div>
                    <div className={styles.value}>{ data.liquidationBonus <= 0
                  ? 0
                  : data.liquidationThreshold}%</div>
                  </Col>
                  <Col span={6}>
                    <div className={styles.label}>Liquidation penalty</div>
                    <div className={styles.value}>{data.liquidationBonus}%</div>
                  </Col>
                  <Col span={6}>
                    <div className={styles.label}>Used as collatera</div>
                    <div className={styles.bool}>{data.usageAsCollateralEnabled ? 'yes': 'no'}</div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
        }
        {!poolReserve && 
        <Col span={16} style={{ paddingRight: 10 }}>
          <Spin />
        </Col>
        }
        <Col span={8}>
          <div className={styles.title}>Your message</div>
          {!wallet && <WalletDisconnected showBack={false} />}

          {wallet && (
            <Spin spinning={!user}>
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
                              withdraw
                            </Button>
                          </Col>
                        </Row>
                        <Row className={styles.msg}>
                          <Col span={12} className={styles.label}>
                            Your wallet balance
                          </Col>
                          <Col span={12} className={styles.value}>
                            {wallet?.balance.toString()} USDT
                          </Col>
                          <Col span={12} className={styles.label}>
                            You have deposited
                          </Col>
                          <Col span={12} className={styles.value}>
                            {underlyingBalance} USDT
                          </Col>
                          <Col span={12} className={styles.label}>
                            Used as collateral
                          </Col>
                          <Col span={12} className={styles.value}>
                            No <Switch checked={userReserve?.usageAsCollateralEnabledOnUser &&
                      poolReserve?.usageAsCollateralEnabled} />
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
                          <Col span={12} className={styles.label}>Borrowed</Col>
                          <Col span={12} className={styles.value}>
                            {totalBorrows || 0} USDT
                          </Col>
                          <Col span={12} className={styles.label}>Fitness factor</Col>
                          <Col span={12} className={styles.value}>
                            {user?.healthFactor || '-1'}
                          </Col>
                          <Col span={12} className={styles.label}>Loan appreciation</Col>
                          <Col span={12} className={styles.value}>
                            {user?.currentLoanToValue || 0}%
                          </Col>
                          <Col span={12} className={styles.label}>Available</Col>
                          <Col span={12} className={styles.value}>
                            {availableBorrows} USDT
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
                      <Col span={8} className={styles.label}>FUSDT</Col>
                      <Col span={6} className={styles.value}>
                        <div>{availableBorrows}</div>
                        <div className={styles.tag}>${availableBorrows}</div>
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
            </Spin>
          )}
        </Col>
      </Row>
    </GridContent>
  );
};
