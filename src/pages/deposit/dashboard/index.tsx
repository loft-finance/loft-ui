import { Row, Col, Button, Switch, Empty } from 'antd';
import { history, FormattedMessage } from 'umi';
import { TokenIcon } from '@aave/aave-ui-kit';
import styles from './index.less';
import { fixedToValue } from '@/utils';
import Percent from '@/components/Percent';

export default ({ depositedPositions }: any) => {
  const handler = {
    deposit(record: any) {
      const { id, underlyingAsset } = record.reserve
      history.push(`/deposit/detail/${underlyingAsset}/${id}`);
    },
    withdraw(record: any) {
      const { id, underlyingAsset } = record.reserve
      history.push(`/deposit/withdraw/${underlyingAsset}/${id}`);
    },
    collateral(record: any) {
      const { id, underlyingAsset } = record.reserve
      history.push(`/deposit/collateral/${underlyingAsset}/${id}/confirm/${record.usageAsCollateralEnabledOnUser ? 0 : 1}`);
    }
  }
  return (<div className={styles.table}>
    <Row className={styles.head}>
      <Col span={7}><FormattedMessage id="pages.deposit.dashboard.table.col.balance" /></Col>
      <Col span={7}><FormattedMessage id="pages.deposit.dashboard.table.col.rate" /></Col>
      <Col span={3}><FormattedMessage id="pages.deposit.dashboard.table.col.collateral" /></Col>
    </Row>
    {depositedPositions.map((item: any, index: number) =>
      <Row key={index} className={styles.row}>
        <Col span={2} className={styles.single}>
          <TokenIcon
            tokenSymbol={item.symbol}
            height={35}
            width={35}
            className="MarketTableItem__token"
          />
        </Col>
        <Col span={5}>
          <div className={styles.multi}>
            {fixedToValue(item.underlyingBalance)}
            <div className={styles.tag}>$ {fixedToValue(item.underlyingBalanceUSD)}</div>
          </div>
        </Col>
        <Col span={7} className={styles.single}>
          <Percent value={item.avg30DaysLiquidityRate || item.aincentivesAPR} />
        </Col>
        <Col span={3} className={styles.single}>
          <Switch onClick={() => handler.collateral(item)} checked={item.usageAsCollateralEnabledOnThePool ? item.usageAsCollateralEnabledOnUser ? true : false : false} checkedChildren="yes" unCheckedChildren="no" disabled={!item.usageAsCollateralEnabledOnThePool} />
        </Col>
        <Col span={7} className={styles.single}>
          <Button size="small" type="primary" shape={'round'} style={{ marginLeft: 5 }} onClick={() => handler.deposit(item)}>
            <FormattedMessage id="pages.deposit.dashboard.button.deposit" />
          </Button>
          <Button size="small" shape={'round'} style={{ marginLeft: 5 }} onClick={() => handler.withdraw(item)}>
            <FormattedMessage id="pages.deposit.dashboard.button.withdraw" />
          </Button>
        </Col>
      </Row>
    )}
    {!depositedPositions.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
  </div>)
}