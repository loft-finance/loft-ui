import { Row, Col, Button, Switch, Empty } from 'antd';
import { TokenIcon } from '@aave/aave-ui-kit';
import styles from './index.less';
export enum BorrowRateMode {
  None = 'None',
  Stable = 'Stable',
  Variable = 'Variable',
}
export default ({borrowedPositions}: any) => {
    return (<div className={styles.table}>
      <Row className={styles.head}>
        <Col span={7}>current balance</Col>
        <Col span={7}>Annual rate of return</Col>
        <Col span={3}>Collateral</Col>
      </Row>
      {borrowedPositions.map((item: any)=>
      <Row className={styles.row}>
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
            {Number(item.currentBorrows)}
            <div className={styles.tag}>${Number(item.currentBorrowsUSD)}</div>
          </div>
        </Col>
        <Col span={7} className={styles.single}>
        {Number(item.borrowRate)}
        </Col>
        <Col span={3} className={styles.single}>
          <Switch defaultChecked checked={item.borrowRateMode === BorrowRateMode.Variable} checkedChildren="yes" unCheckedChildren="no" />
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
      )}

      { !borrowedPositions.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
    </div>)
}