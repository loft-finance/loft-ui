import { Row, Col, Button, Switch, Empty } from 'antd';
import { history, FormattedMessage } from 'umi';
import { TokenIcon } from '@aave/aave-ui-kit';
import styles from './index.less';
export enum BorrowRateMode {
  None = 'None',
  Stable = 'Stable',
  Variable = 'Variable',
}
export default ({ borrowedPositions }: any) => {
  console.log(borrowedPositions)
  const handler = {
    loan(record: any) {
      const { id, underlyingAsset } = record.reserve
      history.push(`/loan/detail/${underlyingAsset}/${id}`);
    },
    repay(record: any) {
      const { id, underlyingAsset } = record.reserve
      history.push(`/loan/repay/${underlyingAsset}/${id}`);
    },
    rate(record: any) {
      const { id, underlyingAsset } = record.reserve
      history.push(`/loan/rate/${underlyingAsset}/${id}/confirm/${record.borrowRateMode === BorrowRateMode.Variable ? BorrowRateMode.Stable : BorrowRateMode.Variable}`);
    }
  }
  return (<div className={styles.table}>
    <Row className={styles.head}>
      <Col span={7}><FormattedMessage id="pages.loan.dashboard.table.col.balance" /></Col>
      <Col span={7}><FormattedMessage id="pages.loan.dashboard.table.col.rate" /></Col>
      {/* <Col span={3}><FormattedMessage id="pages.loan.dashboard.table.col.collateral" /></Col> */}
    </Row>
    {borrowedPositions.map((item: any, index: number) =>
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
            {item.currentBorrows}
            <div className={styles.tag}>${Number(item.currentBorrowsUSD).toFixed(2)}</div>
          </div>
        </Col>
        <Col span={7} className={styles.single}>
          {Number(item.borrowRate).toFixed(2)}%
        </Col>
        {/* <Col span={3} className={styles.single}>
          <Switch onClick={()=>handler.rate(item)} checked={item.borrowRateMode === BorrowRateMode.Variable} checkedChildren="yes" unCheckedChildren="no" />
        </Col> */}
        <Col span={7} className={styles.single}>
          <Button size="small" type="primary" shape={'round'} style={{ marginLeft: 5 }} onClick={() => handler.loan(item)}>
            <FormattedMessage id="pages.loan.dashboard.button.loan" />
          </Button>
          <Button size="small" shape={'round'} style={{ marginLeft: 5 }} onClick={() => handler.repay(item)}>
            <FormattedMessage id="pages.loan.dashboard.button.repay" />
          </Button>
        </Col>
      </Row>
    )}

    {!borrowedPositions.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
  </div>)
}