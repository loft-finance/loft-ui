import { Row, Col, Button, Switch, Empty } from 'antd';
import { TokenIcon } from '@aave/aave-ui-kit';
import styles from './index.less';
export default ({ depositedPositions }: any) => {
    return (<div className={styles.table}>
        <Row className={styles.head}>
          <Col span={7}>current balance</Col>
          <Col span={7}>Annual rate of return</Col>
          <Col span={3}>Collateral</Col>
        </Row>
        {depositedPositions.map((item: any)=>
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
                {Number(item.underlyingBalance)}
                <div className={styles.tag}>${item.underlyingBalanceUSD}</div>
              </div>
            </Col>
            <Col span={7} className={styles.single}>
              {Number(item.liquidityRate)}
            </Col>
            <Col span={3} className={styles.single}>
              <Switch defaultChecked checked={item.usageAsCollateralEnabledOnUser && item.usageAsCollateralEnabledOnThePool} checkedChildren="yes" unCheckedChildren="no" />
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
        )}
        { !depositedPositions.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        {/* <Row className={styles.row}>
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
        </Row> */}
      </div>)
}