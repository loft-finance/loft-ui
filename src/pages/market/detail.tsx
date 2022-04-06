import { useEffect, useState } from 'react';
import { useModel, history, FormattedMessage } from 'umi';
import { Card, Row, Col, Button, Switch, Spin } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import WalletDisconnected from '@/components/Wallet/Disconnected';
import { Pie } from '@ant-design/plots';
import { valueToBigNumber, BigNumber } from '@aave/protocol-js';
import Bignumber from '@/components/Bignumber';
import styles from './detail.less';
import { TokenIcon } from '@aave/aave-ui-kit';
import { normalize } from '@aave/math-utils';

export enum BorrowRateMode {
  None = 'None',
  Stable = 'Stable',
  Variable = 'Variable',
}

export default (props: any) => {
  const { match: { params: { underlyingAsset, id } } } = props

  const { wallet, balances } = useModel('wallet', res => ({
    wallet: res.wallet,
    balances: res.balances
  }))
  const { reserves, user, baseCurrency } = useModel('pool', res => ({
    reserves: res.reserves,
    user: res.user,
    baseCurrency: res.baseCurrency
  }))

  const balance = balances ? balances[underlyingAsset] : '0'

  if (!reserves?.length) {
    history.push('/market')
  }

  const poolReserve: any = reserves.find((res: any) =>
    id ? res.id === id : res.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
  );

  // const marketRefPriceInUsd = normalize(baseCurrency?.marketReferenceCurrencyPriceInUsd || '0', 8)

  // const totalLiquidityInUsd = valueToBigNumber(poolReserve?.totalLiquidity)
  //   .multipliedBy(poolReserve?.priceInMarketReferenceCurrency)
  //   .multipliedBy(marketRefPriceInUsd)
  //   .toString();
  // const totalBorrowsInUsd = valueToBigNumber(poolReserve?.totalDebt)
  //   .multipliedBy(poolReserve?.priceInMarketReferenceCurrency)
  //   .multipliedBy(marketRefPriceInUsd)
  //   .toString();
  // const availableLiquidityInUsd = valueToBigNumber(poolReserve?.availableLiquidity)
  //   .multipliedBy(poolReserve?.priceInMarketReferenceCurrency)
  //   .multipliedBy(marketRefPriceInUsd)
  //   .toString();

  let walletBalance = valueToBigNumber('0').dividedBy(valueToBigNumber(10).pow(18))

  if (balance && poolReserve) {
    walletBalance = valueToBigNumber(balance).dividedBy(valueToBigNumber(10).pow(poolReserve.decimals))
  }

  const userReserve = user
    ? user.userReservesData.find((userReserve: any) =>
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
    if (id) {

      const marketRefPriceInUsd = normalize(baseCurrency?.marketReferenceCurrencyPriceInUsd || '0', 8)

      const poolReserve = reserves.find((res: any) => res.id === id)

      if (poolReserve) {
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
  }, [id])

  const handler = {
    deposit() {
      const { id, underlyingAsset } = poolReserve
      history.push(`/deposit/detail/${underlyingAsset}/${id}`);
    },
    withdraw() {
      const { id, underlyingAsset } = poolReserve
      history.push(`/deposit/withdraw/${underlyingAsset}/${id}`);
    },
    collateral() {
      const { id, underlyingAsset } = poolReserve
      const { usageAsCollateralEnabledOnUser } = userReserve
      history.push(`/deposit/collateral/${underlyingAsset}/${id}/confirm/${usageAsCollateralEnabledOnUser ? 0 : 1}`);
    },
    loan() {
      const { id, underlyingAsset } = poolReserve
      history.push(`/loan/detail/${underlyingAsset}/${id}`);
    },
    repay() {
      const { id, underlyingAsset } = poolReserve
      history.push(`/loan/repay/${underlyingAsset}/${id}`);
    },
  }

  const config = {
    appendPadding: 10,
    data: [
      {
        type: 'Available Liquidity',
        value: Number(Number(data.availableLiquidity).toFixed(2)),
      },
      {
        type: 'Total borrowings',
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
        customHtml: (container: any, view, datum, data) => {
          const { width } = container.getBoundingClientRect();
          return ``;
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

  console.log(data);
  return (
    <GridContent>
      <div className={styles.alert}>
        <FormattedMessage id="pages.market.detail.alert" />
      </div>

      <Row>
        {!!poolReserve &&
          <Col span={16} style={{ paddingRight: 10 }}>
            <div className={styles.title}><FormattedMessage id="pages.market.detail.config" /></div>
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
                              <FormattedMessage id="pages.market.detail.config.TotalBorrowings" />
                            </div>
                            <div className={styles.amount}><Bignumber value={data.totalBorrows} /></div>
                            <div className={styles.value}>$<Bignumber value={data.totalBorrowsInUsd} /></div>
                            <div className={styles.card}>
                              <div className={styles.name}><FormattedMessage id="pages.market.detail.config.ReserveScale" /></div>
                              <div className={styles.value}>$ <Bignumber value={data.totalLiquidityInUsd} /></div>
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
                              <FormattedMessage id="pages.market.detail.config.AvailableLiquidity" />
                            </div>
                            <div className={styles.amount}><Bignumber value={data.availableLiquidity} /></div>
                            <div className={styles.value}>$<Bignumber value={data.availableLiquidityInUsd} /></div>
                            <div className={styles.card}>
                              <div className={styles.name}><FormattedMessage id="pages.market.detail.config.ReserveScale" /></div>
                              <div className={styles.value}>$<Bignumber value={data.availableLiquidityInUsd} /></div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 15 }}>
                    <Col span={12} style={{ paddingRight: 5 }}>
                      <Card
                        title={<FormattedMessage id="pages.market.detail.config.deposit" />}
                        className="CardInfo"
                        headStyle={{ textAlign: 'center', backgroundColor: '#ECF3FF', height: 38 }}
                        bodyStyle={{ padding: '15px 15px 5px' }}
                      >
                        <Row className={styles.CardInfo}>
                          <Col span={12} className={styles.label}>
                            <FormattedMessage id="pages.market.detail.config.DepositApy" />
                          </Col>
                          <Col span={12} className={styles.value}>
                            {Number(data.supplyAPY).toFixed(4)}%
                          </Col>
                          <Col span={12} className={styles.label}>
                            <FormattedMessage id="pages.market.detail.config.DepositAverage" />
                          </Col>
                          <Col span={12} className={styles.value}>
                            {Number(data.supplyAPR).toFixed(4)}
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                    <Col span={12} style={{ paddingLeft: 5 }}>
                      <Card
                        title={<FormattedMessage id="pages.market.detail.config.Borrow" />}
                        className="CardInfo"
                        headStyle={{ textAlign: 'center', backgroundColor: '#ECF3FF', height: 38 }}
                        bodyStyle={{ padding: '15px 15px 5px' }}
                      >
                        <Row className={styles.CardInfo}>
                          <Col span={12} className={styles.label}>
                            <FormattedMessage id="pages.market.detail.config.BorrowApy" />
                          </Col>
                          <Col span={12} className={styles.value}>
                            {Number(data.variableAPY).toFixed(4)}%
                          </Col>
                          <Col span={12} className={styles.label}>
                            <FormattedMessage id="pages.market.detail.config.BorrowAverage" />
                          </Col>
                          <Col span={12} className={styles.value}>
                            {Number(data.variableAPR).toFixed(4)}
                          </Col>
                          <Col span={12} className={styles.label}>
                            <FormattedMessage id="pages.market.detail.config.BorrowPercentage" />
                          </Col>
                          <Col span={12} className={styles.value}>
                            {Number(data.variableOverTotal || 0).toFixed(4)}%
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 15 }} className={styles.info}>
                    <Col span={6}>
                      <div className={styles.label}><FormattedMessage id="pages.market.detail.config.MaxLtv" /></div>
                      <div className={styles.value}>{data.baseLTVasCollateral}%</div>
                    </Col>
                    <Col span={6}>
                      <div className={styles.label}><FormattedMessage id="pages.market.detail.config.LiquidationThreshold" /></div>
                      <div className={styles.value}>{data.liquidationBonus <= 0
                        ? 0
                        : data.liquidationThreshold}%</div>
                    </Col>
                    <Col span={6}>
                      <div className={styles.label}><FormattedMessage id="pages.market.detail.config.LiquidationPenalty" /></div>
                      <div className={styles.value}>{data.liquidationBonus}%</div>
                    </Col>
                    <Col span={6}>
                      <div className={styles.label}><FormattedMessage id="pages.market.detail.config.Collatera" /></div>
                      <div className={styles.bool}>{data.usageAsCollateralEnabled ? 'yes' : 'no'}</div>
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
          <div className={styles.title}><FormattedMessage id="pages.market.detail.your" /></div>
          {!wallet && <WalletDisconnected showBack={false} />}

          {wallet && (
            <Spin spinning={!user}>
              <Row>
                <Col span={24}>
                  <Card bordered={false}>
                    <Row>
                      <Col span={24}>
                        <Row>
                          <Col span={6}><FormattedMessage id="pages.market.detail.your.deposit" /></Col>
                          <Col span={18} style={{ textAlign: 'right' }} >
                            <Button size="small" type="primary" shape="round" onClick={handler.deposit}>
                              <FormattedMessage id="pages.market.detail.your.deposit.button.deposit" />
                            </Button>
                            <Button onClick={handler.withdraw} size="small" shape="round" style={{ marginLeft: 8 }}>
                              <FormattedMessage id="pages.market.detail.your.deposit.button.withdraw" />
                            </Button>
                          </Col>
                        </Row>
                        <Row className={styles.msg}>
                          <Col span={12} className={styles.label}>
                            <FormattedMessage id="pages.market.detail.your.deposit.balance" />
                          </Col>
                          <Col span={12} className={styles.value}>
                            <Bignumber value={walletBalance} /> {poolReserve.symbol}
                          </Col>
                          <Col span={12} className={styles.label}>
                            <FormattedMessage id="pages.market.detail.your.deposit.deposited" />
                          </Col>
                          <Col span={12} className={styles.value}>
                            {Number(underlyingBalance).toFixed(2)} {poolReserve.symbol}
                          </Col>
                          <Col span={12} className={styles.label}>
                            <FormattedMessage id="pages.market.detail.your.deposit.collateral" />
                          </Col>
                          <Col span={12} className={styles.value}>
                            <Switch onClick={handler.collateral} checked={poolReserve?.usageAsCollateralEnabled ? userReserve?.usageAsCollateralEnabledOnUser ? true : false : false} checkedChildren="yes" unCheckedChildren="no" disabled={!poolReserve?.usageAsCollateralEnabled} />
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
                          <Col span={6}><FormattedMessage id="pages.market.detail.your.loan" /></Col>
                          <Col span={18} style={{ textAlign: 'right' }}>
                            <Button size="small" type="primary" shape="round">
                              <FormattedMessage id="pages.market.detail.your.loan.button.loan" />
                            </Button>
                          </Col>
                        </Row>
                        <Row className={styles.msg}>
                          <Col span={12} className={styles.label}><FormattedMessage id="pages.market.detail.your.loan.borrowed" /></Col>
                          <Col span={12} className={styles.value}>
                            {Number(totalBorrows || 0).toFixed(2)} {poolReserve.symbol}
                          </Col>
                          <Col span={12} className={styles.label}><FormattedMessage id="pages.market.detail.your.loan.FitnessFactor" /></Col>
                          <Col span={12} className={styles.value}>
                            {Number(user?.healthFactor || '-1').toFixed(2)}
                          </Col>
                          <Col span={12} className={styles.label}><FormattedMessage id="pages.market.detail.your.loan.LoanAppreciation" />Loan appreciation</Col>
                          <Col span={12} className={styles.value}>
                            {user?.currentLoanToValue || 0}%
                          </Col>
                          <Col span={12} className={styles.label}><FormattedMessage id="pages.market.detail.your.loan.available" /></Col>
                          <Col span={12} className={styles.value}>
                            {Number(availableBorrows).toFixed(2)} {poolReserve.symbol}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                {!!totalBorrows && <Col span={24}>
                  <Row style={{ marginTop: 15, padding: '0 24px' }}>
                    <Col span={8}><FormattedMessage id="pages.market.detail.your.loan.record.loan" /></Col>
                    <Col span={8}><FormattedMessage id="pages.market.detail.your.loan.record.borrowed" /></Col>
                  </Row>
                  <Card
                    bordered={false}
                    bodyStyle={{ paddingTop: 3, paddingBottom: 3 }}
                    style={{ marginTop: 10 }}
                  >
                    <Row className={styles.loan}>
                      <Col span={8} className={styles.label}>
                        <TokenIcon
                          tokenSymbol={poolReserve.symbol}
                          height={35}
                          width={35}
                          tokenFullName={poolReserve.symbol}
                          className="MarketTableItem__token"
                        />
                      </Col>
                      <Col span={6} className={styles.value}>
                        <div>{Number(totalBorrows).toFixed(2)}</div>
                        <div className={styles.tag}>${Number(data.totalBorrowsInUsd).toFixed(2)}</div>
                      </Col>
                      <Col span={9} offset={1} className={styles.label}>
                        <Button size="small" type="primary" shape="round" onClick={handler.loan}>
                          <FormattedMessage id="pages.market.detail.your.loan.record.button.loan" />
                        </Button>
                        <Button size="small" shape="round" style={{ marginLeft: 8 }} onClick={handler.repay}>
                          <FormattedMessage id="pages.market.detail.your.loan.record.button.repay" />
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                </Col>}
              </Row>
            </Spin>
          )}
        </Col>
      </Row>
    </GridContent>
  );
};
