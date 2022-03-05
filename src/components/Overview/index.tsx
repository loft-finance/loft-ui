import { Row, Col, Card, Descriptions } from 'antd';
import { valueToBigNumber } from '@aave/protocol-js';
import styles from './style.less';

export default ({ title = '', items = [], poolReserve = {}, marketRefPriceInUsd = '0' }: any) => {

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
            Deposit to FTM
          </Col>
          <Col span={9} offset={4} className={styles.title}>
            Fantom Reserve Overview
          </Col>
        </Row>
        <Row>
          <Col span={9} offset={1}>
            <Descriptions
              labelStyle={{ color: '#696D85' }}
              contentStyle={{ justifyContent: 'end', color: '#29292D', fontWeight: 'bold' }}
            >
              <Descriptions.Item label="Utilization rate" span={3}>
                {data.utilizationRate}%
              </Descriptions.Item>
              <Descriptions.Item label="Available liquidity" span={3}>
                {data.availableLiquidity} FTM
              </Descriptions.Item>
              <Descriptions.Item label="Deposit APY (Annual Yield)" span={3}>
                {data.depositApy}%
              </Descriptions.Item>
              <Descriptions.Item label="can be used as collateral" span={3}>
                {data.usageAsCollateralEnabled?'yes':'no'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={9} offset={4}>
            <Descriptions
              labelStyle={{ color: '#696D85' }}
              contentStyle={{ justifyContent: 'end', color: '#29292D', fontWeight: 'bold' }}
            >
              <Descriptions.Item label="Asset price" span={3}>
                {data.priceInUsd} USD
              </Descriptions.Item>
              <Descriptions.Item label="Maximum LTV" span={3}>
                {data.baseLTVasCollateral} FTM
              </Descriptions.Item>
              <Descriptions.Item label="Liquidation threshold" span={3}>
                {data.liquidationThreshold}%
              </Descriptions.Item>
              <Descriptions.Item label="Liquidation penal" span={3}>
                {data.liquidationBonus}%
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
