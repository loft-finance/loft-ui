import { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Form, InputNumber } from 'antd';
import { history } from 'umi';
import { TokenIcon } from '@aave/aave-ui-kit';

import Back from '@/components/Back';
import styles from './amount.less';

export default ({ poolReserve, maxUserAmountToWithdraw }: any) => {
  const symbol = poolReserve?poolReserve.symbol:''
  
  useEffect(() => {
    
  }, []);

  const handler = {
    submit(values: any) {
        history.push(`/deposit/withdraw/${poolReserve.underlyingAsset}/${poolReserve.id}/confirm/${values.amount}`);
    },
  };

  return (
    <Card bordered={false}>
      <Back />
      <Card bordered={false}>
          <div className={styles.desc}>
            <div className={styles.title}>Withdraw</div>
            <div className={styles.text}>How much do you want to withdraw</div>
          </div>
          <div className={styles.form}>
            <Row>
              <Col span={8} offset={8}>
                <Form
                  name="basic"
                  layout={'vertical'}
                  onFinish={handler.submit}
                  autoComplete="off"
                >
                  <div className={styles.able}>
                    <span>Able to withdraw</span>
                    <span className={styles.amount}>{Number(maxUserAmountToWithdraw).toFixed(2)} {symbol}</span>
                  </div>
                  <Form.Item
                    name="amount"
                    rules={[{ required: true, message: 'Please input quantity!' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Quantity"
                      prefix={<TokenIcon 
                        tokenSymbol={symbol}
                        height={20}
                        width={20}
                        tokenFullName={''}
                        className="MarketTableItem__token"
                      />}
                      suffix={<a>Max</a>}
                    />
                  </Form.Item>

                  <Form.Item wrapperCol={{ offset: 2, span: 20 }}>
                    <Button block type="primary" htmlType="submit">
                      Continue
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </div>
      </Card>
    </Card>
  );
};