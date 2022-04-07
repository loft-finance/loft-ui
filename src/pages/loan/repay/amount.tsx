import { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Form, Input, message } from 'antd';
import { history, FormattedMessage } from 'umi';
import { TokenIcon } from '@aave/aave-ui-kit';
import Bignumber from '@/components/Bignumber';
import { valueToBigNumber } from '@aave/protocol-js';
import Back from '@/components/Back';
import styles from './amount.less';

export default ({ poolReserve, maxAmountToRepay }: any) => {
  const symbol = poolReserve ? poolReserve.symbol : ''
  const [form] = Form.useForm();
  console.log(poolReserve)
  useEffect(() => {

  }, []);

  const handler = {
    submit(values: any) {
      const amount = valueToBigNumber(values.amount)
      if (amount.gt(maxAmountToRepay)) {
        message.error('The quality must be less than max amount to repay')
        return;
      }
      history.push(`/loan/repay/${poolReserve.underlyingAsset}/${poolReserve.id}/confirm/${values.amount}`);
    },
    max() {
      form.setFieldsValue({
        amount: maxAmountToRepay.toString()
      })
    }
  };

  return (
    <Card bordered={false}>
      <Back />
      <Card bordered={false}>
        <div className={styles.desc}>
          <div className={styles.title}><FormattedMessage id="pages.loan.repay.amount.title" /></div>
          <div className={styles.text}><FormattedMessage id="pages.loan.repay.amount.desc" /></div>
        </div>
        <div className={styles.form}>
          <Row>
            <Col span={8} offset={8}>
              <Form
                name="basic"
                form={form}
                layout={'vertical'}
                onFinish={handler.submit}
                autoComplete="off"
              >
                {/* <div className={styles.able}>
                  <span>total to repay</span>
                  <span className={styles.amount}>{poolReserve.totalDebt} {symbol}</span>
                </div> */}
                <div className={styles.able}>
                  <span><FormattedMessage id="pages.loan.repay.amount.available" /></span>
                  <span className={styles.amount}><Bignumber value={maxAmountToRepay} /> {symbol}</span>
                </div>
                <Form.Item
                  name="amount"
                  rules={[{ required: true, message: <FormattedMessage id="pages.loan.repay.amount.validate" /> }]}
                >
                  <Input
                    style={{ width: '100%' }}
                    placeholder="Quantity"
                    prefix={<TokenIcon
                      tokenSymbol={symbol}
                      height={20}
                      width={20}
                      tokenFullName={''}
                      className="MarketTableItem__token"
                    />}
                    suffix={<a onClick={handler.max}><FormattedMessage id="pages.loan.repay.amount.max" /></a>}
                  />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 2, span: 20 }}>
                  <Button block type="primary" htmlType="submit" disabled={maxAmountToRepay == '0'}>
                    <FormattedMessage id="pages.loan.repay.amount.button" />
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
