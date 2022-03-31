import { Row, Col, Card, Descriptions } from 'antd';
import { FormattedMessage } from 'umi';
import { valueToBigNumber } from '@aave/protocol-js';
import styles from './overview.less';
import Bignumber from '@/components/Bignumber';

export default ({ title = '', items = [], poolReserve = {}, marketRefPriceInUsd = '0' }: any) => {
  const underlyingSymbol = poolReserve?.symbol || ''

  const data = {
    utilizationRate: Number(poolReserve.utilizationRate),
    availableLiquidity: poolReserve.availableLiquidity,
    priceInUsd: valueToBigNumber(poolReserve.priceInMarketReferenceCurrency)
      .multipliedBy(marketRefPriceInUsd)
      .toNumber(),
    depositApy: Number(poolReserve.supplyAPY),
    avg30DaysLiquidityRate: Number(poolReserve.avg30DaysLiquidityRate),
    stableRate: Number(poolReserve.stableBorrowAPY),
    variableRate: Number(poolReserve.variableBorrowAPY),
    avg30DaysVariableRate: Number(poolReserve.avg30DaysVariableBorrowRate),
    usageAsCollateralEnabled: poolReserve.usageAsCollateralEnabled,
    stableBorrowRateEnabled: poolReserve.stableBorrowRateEnabled,
    baseLTVasCollateral: Number(poolReserve.baseLTVasCollateral),
    liquidationThreshold: Number(poolReserve.reserveLiquidationThreshold),
    liquidationBonus: Number(poolReserve.reserveLiquidationBonus),
    borrowingEnabled: poolReserve.borrowingEnabled,
  };

  return (
    <div className={styles.overview}>
      <Card bordered={false}>
        <Row>
          <Col span={9} offset={1} className={styles.title}>
            <FormattedMessage id="pages.deposit.detail.overview.DepositFTM" /> {underlyingSymbol}
          </Col>
          <Col span={9} offset={4} className={styles.title}>
            <FormattedMessage id="pages.deposit.detail.overview.FantomReserve" />
          </Col>
        </Row>
        <Row>
          <Col span={9} offset={1}>
            <Descriptions
              labelStyle={{ color: '#696D85' }}
              contentStyle={{ justifyContent: 'end', color: '#29292D', fontWeight: 'bold' }}
            >
              <Descriptions.Item label={<FormattedMessage id="pages.deposit.detail.overview.UtilizationRate" />} span={3}>
                {data.utilizationRate.toFixed(2)}%
              </Descriptions.Item>
              <Descriptions.Item label={<FormattedMessage id="pages.deposit.detail.overview.AvailableLiquidity" />} span={3}>
                <Bignumber value={data.availableLiquidity} /> {underlyingSymbol}
              </Descriptions.Item>
              <Descriptions.Item label={<FormattedMessage id="pages.deposit.detail.overview.DepositApy" />} span={3}>
                {data.depositApy.toFixed(2)}%
              </Descriptions.Item>
              <Descriptions.Item label={<FormattedMessage id="pages.deposit.detail.overview.collateral" />} span={3}>
                {data.usageAsCollateralEnabled?'yes':'no'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={9} offset={4}>
            <Descriptions
              labelStyle={{ color: '#696D85' }}
              contentStyle={{ justifyContent: 'end', color: '#29292D', fontWeight: 'bold' }}
            >
              <Descriptions.Item label={<FormattedMessage id="pages.deposit.detail.overview.AssetPrice" />} span={3}>
                <Bignumber value={data.priceInUsd} /> USD
              </Descriptions.Item>
              <Descriptions.Item label={<FormattedMessage id="pages.deposit.detail.overview.MaxLtv" />} span={3}>
                <Bignumber value={data.baseLTVasCollateral} /> FTM
              </Descriptions.Item>
              <Descriptions.Item label={<FormattedMessage id="pages.deposit.detail.overview.LiquidationThreshold" />} span={3}>
                {data.liquidationThreshold.toFixed(2)}%
              </Descriptions.Item>
              <Descriptions.Item label={<FormattedMessage id="pages.deposit.detail.overview.LiquidationPenal" />} span={3}>
                {data.liquidationBonus.toFixed(2)}%
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
